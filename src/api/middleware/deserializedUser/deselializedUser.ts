import { Request, Response, NextFunction } from "express";
import { get } from "lodash";
import { verifyJWT } from "../../../utils/jwt";
import { generateNewAccessToken } from "../../../utils/newAccessToken";
import { ApiError, AuthorisedError } from "../../../utils/Error";

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = get(req, "headers.authorization", "").replace(
    /^Bearer\s/,
    ""
  );
  const refreshToken = get(req, "headers.x-refresh") as string;

  if (!accessToken) return next();

  const { decoded, expired } = verifyJWT(accessToken);

  if (decoded) {
    res.locals.user = decoded;
    return next();
  }

  if (refreshToken && expired) {
    try {
      const { token, error } = await generateNewAccessToken(refreshToken);

      if (error) {
        throw new AuthorisedError(error);
      }

      if (token) {
        const result = verifyJWT(token);
        res.locals.user = result.decoded;
        next();
      }
    } catch (error: any) {
      throw new ApiError(error.message);
    }
  }
};
