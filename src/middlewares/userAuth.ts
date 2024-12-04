import { NextFunction, Request, Response } from 'express';
import HttpError from '../errors/HttpError';
import jwt from 'jsonwebtoken';
import { ExtendedRequest, User } from '../types/types';

function userAuth(
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.access_token;

  if (!token) {
    throw new HttpError(401, 'You must send an access token');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.TOKEN_SECRET!) as User;
  } catch (error) {
    throw new HttpError(401, 'Token invalid or expired');
  }

  req.user = payload;

  next();
}

export default userAuth;