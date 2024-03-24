import jwt from "jsonwebtoken";
import config from "../../config";

const privateKey = Buffer.from(config.rsaPriviteKey || "", "base64").toString(
  "ascii"
);
const publicKey = Buffer.from(config.rsaPublicKey || "", "base64").toString(
  "ascii"
);

export const signWithJWT = (
  object: Object,
  options?: jwt.SignOptions | undefined
) => {
  return jwt.sign(object, privateKey, {
    ...(options && options),
    algorithm: "RS256",
  });
};

export const verifyJWT = (token: string) => {
  try {
    const decoded = jwt.verify(token, publicKey);
    if (!decoded) throw new Error("Invalid Token, (verify jwt)");

    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (error: any) {
    console.error(error.message, "Error in verify jwt");
    return {
      valid: false,
      expired: error.message === "jwt expired",
      decoded: null,
    };
  }
};
