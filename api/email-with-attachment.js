const multer = require("multer");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

// Setup multer
const upload = multer({ dest: "/tmp/" });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await runMiddleware(req, res, upload.single("file"));

  const { email } = req.body;
  const file = req.file;

  if (!email || !file) {
    return res.status(400).json({ message: "Email and file are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Here is your file",
      text: "Please find the attached file.",
      attachments: [
        {
          filename: file.originalname,
          path: file.path,
        },
      ],
    });

    fs.unlinkSync(file.path); // cleanup temp file
    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
};
