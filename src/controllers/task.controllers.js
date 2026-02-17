import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/aynchandler.js";
import mongoose from "mongoose";

const getTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project Not Found");
  }

  const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId),
  }).populate("assignedTo", "avatar username fullname");

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "task fetched successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0],
        },
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              createdBy: {
                $arrayElemAt: ["$createdBy", 0],
              },
            },
          },
        ],
      },
    },
  ]);

  if (!task || task.length === 0) {
    throw new ApiError(404, "Task Not found");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, task, "task data fetched successfully"));
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project Not Found");
  }

  const files = req.files || [];

  const attachments = files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.originalname}`,
      mimeType: file.mimeType,
      size: file.size,
    };
  });

  const task = await Task.create({
    title,
    description,
    project: new mongoose.Types.objectId(projectId),
    assignedTo: assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : undefined,
    status,
    assignedBy: new mongoose.Types.ObjectId(req.user._id),
    attachments,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, task, "task created successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;
  const { taskId } = req.params;

  const task = await Task.findByIdAndUpdate(
    taskId,
    {
      title,
      description,
      assignedTo: assignedTo
        ? new mongoose.Types.ObjectId(assignedTo)
        : undefined,
      status,
    },
    { new: true },
  );

  if (!task) {
    throw new ApiError(404, "Task Not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { task }, "task updated successfully "));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findByIdAndDelete(taskId);

  if (!task) {
    throw new ApiError(404, "Task Not Found");
  }

  return res.status(200).json(new ApiResponse(200, {}, "task deleted "));
});

const createSubTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, isCompleted } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task Not Found");
  }

  const subtask = await SubTask.create({
    title,
    task: new mongoose.Types.ObjectId(taskId),
    createdBy: new mongoose.Types.ObjectId(req.user._id),
    isCompleted: isCompleted === undefined ? undefined : isCompleted,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, subtask, "subtask created successfully"));
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { title, isCompleted } = req.body;
  const { subTaskId } = req.params;

  const subtask = await SubTask.findByIdAndUpdate(
    subTaskId,
    {
      title,
      isCompleted: isCompleted === undefined ? undefined : isCompleted,
    },
    { new: true },
  );

  if (!subtask) {
    throw new ApiError(404, "Task Not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { subtask }, "task updated successfully "));
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;

  const subtask = await SubTask.findByIdAndDelete(subTaskId);

  if (!subtask) {
    throw new ApiError(404, "SubTask Not Found");
  }

  return res.status(200).json(new ApiResponse(200, {}, "subtask deleted "));
});

export {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTask,
  getTaskById,
  updateSubTask,
  updateTask,
};
