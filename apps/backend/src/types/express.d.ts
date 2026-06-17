import { type User } from "shared";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};