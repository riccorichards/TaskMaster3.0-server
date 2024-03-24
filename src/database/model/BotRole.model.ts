import mongoose from "mongoose";
import { BotRoleDocument } from "../type";

const BotRole = new mongoose.Schema({
  user: { type: String },
  role: { type: String, required: true },
});

const BotRoleModel = mongoose.model<BotRoleDocument>("BotRole", BotRole);

export default BotRoleModel;
