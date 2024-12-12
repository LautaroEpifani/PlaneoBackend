import { Request, RequestHandler, Response } from "express";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcrypt";

import db from "../db/connection";
import { projects, users } from "../db/schema";
import { AddUserSchema, IdSchema, LoginSchema } from "../schemas/userSchemas";
import HttpError from "../errors/HttpError";
import ValidationError from "../errors/ValidationError";
import jwt from "jsonwebtoken";

async function getAllUsers(req: Request, res: Response) {
  const allUsers = await db.select().from(users);

  res.send(allUsers);
}

async function getOneUser(req: Request, res: Response) {
  const userId = req.params.userId;

  // Verificaríamos y si no, error
  const { success, data: id, error } = IdSchema.safeParse(userId);

  if (!success) {
    throw new ValidationError(error);
  }
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id)));

  if (!user) {
    throw new HttpError(404, `User with ID ${id} not found`);
  }

  res.send(user);
}

async function addOneUser(req: Request, res: Response) {
  const user = req.body;

  // Validamos usuario
  const { success, data: newUser, error } = AddUserSchema.safeParse(user);

  if (!success) {
    throw new ValidationError(error);
  }

  // Como sabemos que ha ido bien, ahora ya podemos encriptar la contraseña
  const saltNumber = 10;
  const encriptedPassword = await bcrypt.hash(newUser.password, saltNumber);

  // cambiar contraseña plana por encriptada
  newUser.password = encriptedPassword;

  const [userDB] = await db.insert(users).values(newUser).returning({
    id: users.id,
    name: users.name,
  });

  res.status(201).send(userDB);
}

async function login(req: Request, res: Response) {
  const { success, data: loginUser, error } = LoginSchema.safeParse(req.body);

  if (!success) {
    throw new ValidationError(error);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, loginUser.email));

  if (!user) {
    throw new HttpError(404, "Email or password incorrect");
  }

  const isPasswordCorrect = await bcrypt.compare(
    loginUser.password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new HttpError(404, "Email or password incorrect");
  }

  const userToSend = {
    id: user.id,
    name: user.name,
  };

  const token = jwt.sign(userToSend, process.env.TOKEN_SECRET!, {
    expiresIn: 3600,
  });

  res.cookie("access_token", token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 1000,
    sameSite: "none",
    secure: true,
  });

  res.send(userToSend);
}

async function checkSession(req: Request, res: Response) {
  const token = req.cookies.access_token;

  if (!token) {
    throw new HttpError(401, "You must send an access token");
  }
  let payload;
  try {
    payload = jwt.verify(token, process.env.TOKEN_SECRET!);
  } catch (error) {
    throw new HttpError(401, "Token invalid or expired");
  }

  res.status(200).send({ message: "Session is valid", user: payload });
}

async function logout(req: Request, res: Response) {
  res.clearCookie('access_token', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({ message: 'Logged out successfully' });
}


async function createProjectForUser(userId: number, projectName: string) {
  // Paso 1: Verificar si el proyecto con id = 1 ya existe
  const existingProject = await db.select().from(projects).where(eq(projects.id, 1)).limit(1); // Usamos limit(1) para obtener un solo resultado

  // Paso 2: Si el proyecto no existe, crearlo con id = 1
  if (existingProject.length === 0) {
    await db.insert(projects).values({
      id: 1,
      name: projectName,
      description: 'Este es el único proyecto disponible.',
    });
  } else {
    // Si el proyecto existe, solo actualizar su nombre
    await db.update(projects).set({ name: projectName }).where(eq(projects.id, 1));
  }

  // Paso 3: Asociar el usuario con el proyecto id = 1
  await db.update(users).set({ projectId: 1 }).where(eq(users.id, userId));

  return { message: 'Proyecto creado y asociado exitosamente al usuario.' };
}

export { getAllUsers, getOneUser, addOneUser, login, checkSession, logout, createProjectForUser };
