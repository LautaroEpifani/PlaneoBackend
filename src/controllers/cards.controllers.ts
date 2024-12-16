import { Request, Response } from 'express';
import { eq, inArray, sql, SQL } from "drizzle-orm";
import { cards } from '../db/schema';
import db from '../db/connection';

// Obtener todas las tarjetas
export const getAllCards = async (req: Request, res: Response) => {
  try {
    const allCards = await db.select().from(cards);
    res.status(200).send(allCards);  // Usamos send en vez de json
  } catch (error) {
    res.status(500).send({ error: 'Error fetching cards' });
  }
};

// Obtener una tarjeta por ID
export const getCardById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const card = await db
      .select()
      .from(cards)
      .where(eq(cards.id, Number(id)))
      .limit(1);

    if (!card.length) res.status(404).send({ error: 'Card not found' });
    res.status(200).send(card[0]);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching card' });
  }
};


// Crear una nueva tarjeta
export const createCard = async (req: Request, res: Response) => {
  try {
    const { cardName, description, createdBy, assignedTo, status = 'todo', order, projectId } = req.body; // Ahora se incluye el status
    const [newCard] = await db
      .insert(cards)
      .values({ cardName, description, createdBy, assignedTo, status, order, projectId })
      .returning();
    res.status(201).send(newCard);
  } catch (error) {
    res.status(500).send({ error: 'Error creating card' });
  }
};


// Actualizar una tarjeta por ID
export const updateCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cardName, description, createdBy, assignedTo, status, order } = req.body; 

    const updatedAt = new Date().toISOString();
  
    const updatedCard = await db
      .update(cards)
      .set({ cardName, description, createdBy, assignedTo, status, order, updatedAt })
      .where(eq(cards.id, Number(id)))
      .returning();

    if (!updatedCard.length)  res.status(404).send({ error: 'Card not found' });
    res.status(200).send(updatedCard[0]);
  } catch (error) {
    res.status(500).send({ error: 'Error updating card' });
  }
};


// Eliminar una tarjeta por ID
export const deleteCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Eliminar la tarjeta por ID
    const deletedCard = await db
      .delete(cards)
      .where(eq(cards.id, Number(id)))
      .returning(); 

    if (!deletedCard.length) {
     res.status(404).send({ error: 'Card not found' });  // Usamos send
    }

    res.status(200).send({ message: 'Card deleted successfully', deletedCard });  // Usamos send
  } catch (error) {
    res.status(500).send({ error: 'Error deleting card' });
  }
};
