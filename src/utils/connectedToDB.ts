import mongoose from "mongoose";

export default async function connectedToDB(uri: string) {
  return mongoose
    .connect(uri)
    .then(() => console.log("MongoDB was successfully connected"))
    .catch((err) => console.log(err));
}
