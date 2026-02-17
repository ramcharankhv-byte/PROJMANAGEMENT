import express, { urlencoded } from "express";
import cors from "cors";
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import cookieParser from "cookie-parser";
const app = express();

//for basic configuration to read form frontend
app.use(express.json()); // to parse json
app.use(express.urlencoded({ extended: true })); //to encode url data
app.use(express.static("public")); //to access public files
app.use(cookieParser());
//cors
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//healthcheck
app.use("/api/v1/healthcheck", healthCheckRouter);
app.get("/", (req, res) => {
  res.send("Hello World from Express!");
});

app.use("/api/v1/auth/", authRouter);
app.use("/api/v1/project/", projectRouter);
export default app;
