import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import {
  verifyJwt,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import {
  getProjects,
  getProjectByID,
  createProject,
  deleteProject,
  updateProject,
  addMembersToProject,
  getProjectMembers,
  deleteProjectMember,
  updateMemberRole,
} from "../controllers/project.controllers.js";
import {
  createProjectValidator,
  addMembersToProjectValidator,
} from "../validators/index.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router = Router();
router.use(verifyJwt);

router
  .route("/")
  .get(getProjects)
  .post(createProjectValidator(), validate, createProject);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRole), getProjectByID)
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createProjectValidator(),
    validate,
    updateProject,
  )
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject);

router
  .route("/:projectId/members")
  .get(getProjectMembers)
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    addMembersToProjectValidator(),
    validate,
    addMembersToProject,
  );

router
  .route("/:projectId/members/:userId")
  .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateMemberRole)
  .delete(
    validateProjectPermission([UserRolesEnum.ADMIN], deleteProjectMember),
  );

export default router;
