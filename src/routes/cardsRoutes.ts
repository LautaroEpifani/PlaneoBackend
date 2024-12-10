import express from 'express';
import { createCard, deleteCard, getAllCards, getCardById, updateCard } from '../controllers/cards.controllers';

const cardsRouter = express.Router();

// CRUD Routes
cardsRouter.get('/', getAllCards);             // Obtener todas las tarjetas
cardsRouter.get('/:id', getCardById);         // Obtener una tarjeta por ID
cardsRouter.post('/', createCard);             // Crear una tarjeta
cardsRouter.put('/:id', updateCard);          // Actualizar una tarjeta por ID
cardsRouter.delete('/:id', deleteCard);       // Eliminar una tarjeta por ID

export default cardsRouter;
