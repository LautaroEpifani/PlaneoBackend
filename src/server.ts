import 'dotenv/config';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import userRouter from './routes/usersRoutes';
import cardsRouter from './routes/cardsRoutes';
import ValidationError from './errors/ValidationError';
import HttpError from './errors/HttpError';
// import { v2 as cloudinary } from 'cloudinary'
import { checkSession } from './controllers/users.controllers';
import db from './db/connection';
import { updateAllCards } from './controllers/cards.controllers';


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

app.use('/cards', cardsRouter);

app.put('/cards/bulk-update', async (req, res) => {
  const { cards } = req.body;

  console.log(cards);

  try {
 
    const updatedCards = await updateAllCards(cards);

 
    res.status(200).send({ message: 'Cards updated successfully', cards: updatedCards });
  } catch (error) {
   
    res.status(500).send({ message: 'Failed to update cards' });
  }
});


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