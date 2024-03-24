import mongoose from "mongoose";
import { BotMsgDocument } from "../type";

const BotMsg = new mongoose.Schema({
  user: { type: String },
  msg: { type: String, required: true },
  role: { type: String, required: true },
});

const BotMsgModel = mongoose.model<BotMsgDocument>("BotMsg", BotMsg);

export default BotMsgModel;
