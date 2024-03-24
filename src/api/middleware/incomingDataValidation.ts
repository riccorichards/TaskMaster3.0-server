import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

export const incomingDataValidation =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(error.message);
        return res.status(400).json(error.errors);
      }
    }
  };
