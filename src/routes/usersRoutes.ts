import express from 'express';
import {
  addOneUser,
  checkSession,
  getAllUsers,
  getOneUser,
  login,
  logout,
} from '../controllers/users.controllers';

const userRouter = express.Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:userId', getOneUser);
userRouter.post('/', addOneUser);
userRouter.post('/login', login);
userRouter.post('/logout', logout);

export default userRouter;