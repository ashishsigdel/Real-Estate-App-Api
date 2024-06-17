import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const sendEmail = async (data, req, res, next) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // `true` for port 465, `false` for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      to: data.to, // list of receivers
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`, // sender address
      subject: data.subject, // Subject line
      text: data.text, // plain text body
      html: data.html, // html body
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    return next(error); // Pass the error to the next middleware
  }
};
