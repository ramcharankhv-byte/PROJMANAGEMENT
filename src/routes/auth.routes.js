import { Router } from "express";
import {
  registerUser,
  login,
  logout,
  getCurrentUser,
  verifyEmail,
  resendEmailVerifcationToken,
  refreshAccessToken,
  forgotPasswordRequest,
  resetPassword,
  changePassword,
} from "../controllers/auth.controllers.js";
const authRouter = Router();
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  userRegisterValidator,
  userLoginValidator,
  changePasswordValidator,
  resetForgotPasswordValidator,
  forgotPasswordvalidator,
} from "../validators/index.js";

//unsecure route
authRouter
  .route("/register")
  .post(userRegisterValidator(), validate, registerUser);
authRouter.route("/login").post(userLoginValidator(), validate, login);
authRouter.route("/verify-email/:verificationToken").get(verifyEmail);
authRouter.route("/refresh-token").get(refreshAccessToken);
authRouter
  .route("/forgot-password")
  .get(forgotPasswordvalidator(), validate, forgotPasswordRequest);
authRouter
  .route("/reset-password/:resetToken")
  .post(resetForgotPasswordValidator(), validate, resetPassword);
authRouter.route("/resend-verification").post(resendEmailVerifcationToken);

//secure routes
authRouter.route("/logout").post(verifyJwt, logout);
authRouter.route("/current-user").get(verifyJwt, getCurrentUser);
authRouter
  .route("/change-password")
  .post(verifyJwt, changePasswordValidator(), validate, changePassword);
export default authRouter;
