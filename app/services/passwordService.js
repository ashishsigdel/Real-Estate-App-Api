import bcrypt from "bcrypt";
import PasswordValidator from "password-validator";

const saltRounds = 10;

export const hashPassword = async (password) => {
  if (!password) return null;

  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const comparePassword = async (password, encryptedPassword) => {
  if (!password || !encryptedPassword) return false;

  return await bcrypt.compare(password, encryptedPassword);
};

export const validatePassword = (password) => {
  if (!password) return false;

  const schema = new PasswordValidator();

  schema
    .is()
    .min(6) // Minimum length 8
    .is()
    .max(100) // Maximum length 100
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .not()
    .spaces(); // Should not have spaces

  return schema.validate(password);
};
