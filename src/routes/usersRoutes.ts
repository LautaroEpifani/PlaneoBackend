import express from 'express';
import {
  addOneUser,
  checkSession,
  getAllUsers,
  getOneUser,
  login,
} from '../controllers/users.controllers';

const userRouter = express.Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:userId', getOneUser);
userRouter.post('/', addOneUser);
userRouter.post('/login', login);

export default userRouter;