import { Request } from 'express';

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};


type ExtendedRequest = Request & {
  user?: User;
};

export type { User, ExtendedRequest };