import 'dotenv/config';
import 'express-async-errors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import userRouter from './routes/usersRoutes';
import ValidationError from './errors/ValidationError';
import HttpError from './errors/HttpError';
import { v2 as cloudinary } from 'cloudinary'
import { checkSession } from './controllers/users.controllers';

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
app.get('/', (req, res) => {
  res.send('<h1>hola</h1>');
});

app.use('/users', userRouter);

app.get('/verifySession', checkSession)

// Middleware 404 not found
app.use((req, res) => {
  res.status(404).send({
    message: 'Invalid route',
  });
});

app.use(
  (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
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
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Escuchando en el puerto ${PORT}...`);
});