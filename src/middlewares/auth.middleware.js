import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/project.models.js";
import { asyncHandler } from "../utils/aynchandler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers["authorization"]?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(400, "Unauthorized");
  }

  try {
    const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findOne({ _id: decodedtoken?._id }).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );
    if (!user) {
      throw new ApiError(400, "Invalid Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(400, "Invalid Token");
  }
});

export const validateProjectPermission = (roles = []) => {
  asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(400, "Project Not Found");
    }
    const project = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id),
    });

    if (!project) {
      throw new ApiError(400, "Project Not Found");
    }

    const givenRole = project?.role;

    req.user.role = givenRole;

    if (!roles.includes(givenRole)) {
      throw new ApiError(403, "You dont have permission");
    }
  });
};
