import { body } from "express-validator";
import { AvailableUserRole } from "../utils/constants.js";
const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email is invalid"),

    body("username")
      .trim()
      .notEmpty()
      .withMessage("username is required")
      .isLowercase()
      .withMessage("username must be of lowercase")
      .isLength({ min: 3 })
      .withMessage("Username must be atleast 3 characters long"),

    body("password").trim().notEmpty().withMessage("Password is required"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email is invalid"),

    body("password").trim().notEmpty().withMessage("Password is required"),
  ];
};

const changePasswordValidator = () => {
  return [
    body("oldPassword")
      .trim()
      .notEmpty()
      .withMessage("oldPassword is required"),
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("newPassword is required"),
  ];
};

const forgotPasswordvalidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email is invalid"),
  ];
};

const resetForgotPasswordValidator = () => {
  return [
    body("newPassword").trim().notEmpty().withMessage("Password is required"),
  ];
};

const createProjectValidator = () => {
  return [
    body("name").notEmpty().withMessage("name is required"),

    body("description").optional(),
  ];
};

const addMembersToProjectValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email required")
      .isEmail()
      .withMessage("Email is invalid"),

    body("role")
      .notEmpty()
      .withMessage("role required")
      .isIn(AvailableUserRole)
      .withMessage("Role is Invalid"),
  ];
};
export {
  userRegisterValidator,
  userLoginValidator,
  changePasswordValidator,
  resetForgotPasswordValidator,
  forgotPasswordvalidator,
  createProjectValidator,
  addMembersToProjectValidator,
};
