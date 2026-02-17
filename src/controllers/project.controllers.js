import {
  sendEmail,
  emailVerificationMailgenContent,
  forgotpassMailgenContent,
} from "../utils/mail.js";
import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/aynchandler.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import mongoose from "mongoose";
import { pipeline } from "nodemailer/lib/xoauth2/index.js";

const getProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "projects",
        foreignField: "_id",
        as: "projects",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "projects",
              as: "projectmembers",
            },
          },
          {
            $addFields: {
              members: {
                $size: "$projectmembers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$projects",
    },
    {
      $project: {
        project: {
          _id: 1,
          name: 1,
          description: 1,
          members: 1,
          createdAt: 1,
          createdBy: 1,
        },
        role: 1,
        _id: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched Successfully"));
});

const getProjectByID = asyncHandler(async (req, res) => {
  const { objectId } = req.params;
  const project = await Project.findById(objectId);

  if (!project) {
    throw new ApiError(404, "project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "project fetched successfully"));
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(project._id),
    role: UserRolesEnum.ADMIN,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    throw new ApiError(404, "Project Not Found");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Project Deleted Successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { projectId } = req.params;

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description,
    },
    { new: true },
  );

  if (!project) {
    throw new ApiError(404, "Project Not Found");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project Updated Successfully"));
});

const addMembersToProject = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const { projectId } = req.params;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project Not Found");
  }

  const projectMember = await ProjectMember.findByIdAndUpdate(
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
    },
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(project._id),
      role: role,
    },
    {
      new: true,
      upsert: true,
    },
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, projectMember, "Project Member Added Successfully"),
    );
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project Not Found");
  }

  const projectmembers = await ProjectMember.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        user: {
          $arrayElemAt: ["$user", 0],
        },
      },
    },
    {
      $project: {
        project: 1,
        user: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0,
      },
    },
  ]);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        projectmembers,
        "Project Members Fetched successfully",
      ),
    );
});

const deleteProjectMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) {
    throw new ApiError(400, "Project Member not found");
  }

  projectMember = await ProjectMember.findByIdAndDelete(projectMember._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project Member Deleted successfully"));
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { newRole } = req.body;
  const { projectId, userId } = req.params;

  if (!AvailableUserRole.includes(newRole)) {
    throw new ApiError(400, "Invalid Error");
  }

  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) {
    throw new ApiError(400, "Project Member not found");
  }

  projectMember = await ProjectMember.findByIdAndUpdate(
    projectMember._id,
    {
      role: newRole,
    },
    { new: true },
  );
  if (!projectMember) {
    throw new ApiError(400, "Project Member not found");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        projectMember,
        "Project Members Updated successfully",
      ),
    );
});

export {
  getProjects,
  getProjectByID,
  createProject,
  deleteProject,
  updateProject,
  addMembersToProject,
  getProjectMembers,
  deleteProjectMember,
  updateMemberRole,
};
