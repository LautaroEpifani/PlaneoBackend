import "dotenv/config";
import "express-async-errors";
import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import userRouter from "./routes/usersRoutes";
import cardsRouter from "./routes/cardsRoutes";
import ValidationError from "./errors/ValidationError";
import HttpError from "./errors/HttpError";
// import { v2 as cloudinary } from 'cloudinary'
import {
  checkSession,
  createProjectForUser,
  deleteProject,
  getUserProjects,
} from "./controllers/users.controllers";
import { cards, projects } from "./db/schema";

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_BASE_URL,
    credentials: true,
  })
);

// Peticion normal
app.get("/", (req, res) => {
  res.send("<h1>hola</h1>");
});

app.use("/users", userRouter);

app.use("/cards", cardsRouter);

app.get("/verifySession", checkSession);

app.get("/getProjects/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const projects = await getUserProjects(userId);
  if (projects) {
    res.send({ projects });
  } else {
    res.status(404).json({ message: "No se encontró el proyecto" });
  }
});

app.delete('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    await deleteProject(parseInt(projectId));
    res.status(200).send({ message: 'Proyecto y tarjetas asociadas eliminados correctamente' });
  } catch (error) {
    console.error('Error eliminando el proyecto:', error);
    res.status(500).send({ error: 'Error al eliminar el proyecto y sus tarjetas' });
  }
});

app.post("/createProject", async (req, res) => {
  const { userId, projectName } = req.body;
  try {
    const result = await createProjectForUser(userId, projectName);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Hubo un error al crear el proyecto." });
  }
});

// Middleware 404 not found
app.use((req, res) => {
  res.status(404).send({
    message: "Invalid route",
  });
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ValidationError) {
    res.status(error.statusCode).send({
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).send({
      message: error.message,
    });
    return;
  }

  if (error instanceof Error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Escuchando en el puerto ${PORT}...`);
});

const shutdown = () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed gracefully");
    process.exit(0);
  });

  // Si el servidor no cierra dentro de 10 segundos, forzamos el cierre
  setTimeout(() => {
    console.error("Forcing server shutdown");
    process.exit(1);
  }, 10000);
};

// Escucha señales de terminación
process.on("SIGINT", shutdown); // Ctrl + C
process.on("SIGTERM", shutdown);
