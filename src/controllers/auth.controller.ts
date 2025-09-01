import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AppError } from "../utils/errors";

export const AuthController = {
  async signUp(req: Request, res: Response) {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password || !fullName) {
        throw new AppError("Email, password, and full name are required", 400);
      }

      const data = await AuthService.signUp({ email, password, fullName });
      res.status(201).json(data);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: "An unexpected error occurred during sign up." });
      }
    }
  },

  async signIn(req: Request, res: Response) {
    console.log("Inside AuthController.signIn"); 
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError("Email and password are required", 400);
      }

      const data = await AuthService.signIn({ email, password });
      res.status(200).json(data);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: "An unexpected error occurred during sign in." });
      }
    }
  },

  async signOut(req: Request, res: Response) {
    try {
      await AuthService.signOut();
      res.status(200).json({ message: "Successfully signed out." });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: "An unexpected error occurred during sign out." });
      }
    }
  },
};
