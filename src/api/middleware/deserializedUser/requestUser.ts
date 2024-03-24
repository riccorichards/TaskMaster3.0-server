import { Request, Response, NextFunction } from "express";

export const requestUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = res.locals.user;
  if (!user)
    return res.status(403).json({ msg: "Could not found the user..." });

  next();
};
