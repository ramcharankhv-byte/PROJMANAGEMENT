import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/aynchandler.js";

const healthcheck = asyncHandler(async (req, res, next) => {
  res.status(200).json(new ApiResponse(200, { message: "API is running" }));
});

export { healthcheck };
