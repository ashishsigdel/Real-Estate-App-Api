import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { rootDir } from "../services/fileStorageService.js";

const templatesDir = path.join(rootDir, "app", "templates");

/**
 * @description HTML template utility functions
 * @module htmlTemplates
 * @param {string} templateName - Template name to compile. Note: only pass file name without extension, e.g. "welcome" if full filaname is welcome.hbs, .hbs extension will be added automatically
 * @param {object} data - Data to compile with template
 * @example import emailTemplateCompiler from "./app/utils/emailTemplates.js";
 * const htmlText = htmlTemplateCompiler("index", {
      name: "Krishna Adhikari",
      age: 23,
      hobbies: ["coding", "football", "basketball", "swimming"],
      isRegistered: true,
    });
 * @returns {string} Compiled template
 */
export const htmlTemplateCompiler = (templateName, data) => {
  const template = fs.readFileSync(
    path.join(templatesDir, `${templateName}.hbs`),
    "utf8"
  );

  const compiledTemplate = Handlebars.compile(template);

  return compiledTemplate(data);
};

/**
 * @description Get OTP email template
 * @param {string} greetings - Greetings message for email
 * @param {string} logoLink - Logo link for email
 * @param {string} title - Title 
 * @param {string} otp - OTP to show in email
 * @param {string} description - Description to show in email
 * @param {string} thanks - Thanks message for email eg. "Thanks, Krishna Adhikari"
 * @param {string} supportEmail - Support email address
 * @returns {string} Compiled template
 * @example import { getOtpTemplate } from "./app/utils/htmlTemplateUtils.js";
 * const htmlText = getWelcomeTemplate({
      greetings: "Hello",
      logoLink: "https://jnif.org/logo.png",
      title: "Welcome to teispace",
      description: "You have successfully created your account in teispace.",
      thanks: "Teispace Team",
      supportEmail: "support@jnif.org"
    });
  */
export const getOtpTemplate = ({
  greetings = "Hello",
  logoLink = "https://jnif.org/logo.png",
  title = "Please use the One Time Password (OTP) provided below:",
  otp = "",
  description = "Note: The above OTP will expire in next ten minutes. Once expired, you have to regenerate another otp.",
  thanks = process.env.EMAIL_FROM_NAME,
  supportEmail = process.env.SUPPORT_EMAIL,
}) => {
  return htmlTemplateCompiler("otp", {
    greetings,
    logoLink,
    title,
    otp,
    description,
    thanks,
    supportEmail,
  });
};
