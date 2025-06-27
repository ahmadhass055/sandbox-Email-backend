const multer = require("multer");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

// Use temp storage for Vercel
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
  res.status(200).json({ message: "API route is working!" });
};

