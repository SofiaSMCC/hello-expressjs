import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../types/user";
import dotenv from "dotenv";
import logger from "../logger";

dotenv.config();

const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
  throw new Error("Secret Key is not defined");
}

let users: User[] = [];

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { username, password } = req.body;

  try {
    const existingUser = users.find((user) => user.username === username);

    if (existingUser) {
      res.status(400).json({ message: "User already exist." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { username, password } = req.body;

  try {
    const user = users.find((user) => user.username === username);
    if (!user) {
      const warn_message = "Login attempt with incorrect username";
      logger.warn(`${warn_message}: ${username}`);
      res.status(401).json({ message: warn_message });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const warn_message = "Login attempt with incorrect password";
      logger.warn(`${warn_message}: ${password}`);
      res.status(401).json({ message: warn_message });
      return;
    }

    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (token) {
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        logger.error(`Failed JWT authentication: ${err.message}`);
        return res.sendStatus(401);
      }

      // @ts-ignore
      req.user = user;
      next();
    });
  } else {
    logger.error("JWT token missing in request");
    res.sendStatus(401);
  }
};
