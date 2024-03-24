import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import config from "../config";
import connectedToDB from "./utils/connectedToDB";
import Api from "./api/Api";

export const runServer = async () => {
  const app = express();

  app.use(
    cors({
      origin: config.origin,
      credentials: true,
    })
  );

  app.use(express.json());

  await connectedToDB(config.mongo_prod || "");

  Api(app);

  // api error endpiont
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const data = err.message || err.data;
    return res.status(status).json(data);
  });

  const PORT = process.env.PORT || config.port;

  app.listen(PORT, async () => {
    console.log(`We are Running at http://localhost:${PORT}`);
  });
};
runServer();
