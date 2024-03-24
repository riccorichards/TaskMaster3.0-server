import { get } from "lodash";
import { signWithJWT, verifyJWT } from "./jwt";
import SessionModel from "../database/model/Session.model";
import { AuthorisedError } from "./Error";

export const generateNewAccessToken = async (refreshToken: string) => {
  const { decoded, valid, expired } = verifyJWT(refreshToken);

  if (!valid) {
    if (expired) {
      return { token: null, error: "Expired refresh token" };
    }
    throw new Error("Invalid refresh token");
  }

  if (!decoded || !get(decoded, "session")) {
    throw new AuthorisedError("Something went wrong");
  }

  const session = await SessionModel.findById(get(decoded, "session"));

  if (!session || !session.valid) {
    throw new AuthorisedError("Invalid session");
  }

  const accessToken = signWithJWT(
    { user: session.user, session: session._id },
    { expiresIn: 86400 }
  );

  return { token: accessToken, error: undefined };
};
