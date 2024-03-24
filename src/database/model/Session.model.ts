import mongoose from "mongoose";
import { SessionDocument } from "../type";

const CreateSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: "User" },
  valid: { type: Boolean, default: true },
  userAgent: { type: String },
});

const SessionModel = mongoose.model<SessionDocument>(
  "Session",
  CreateSessionSchema
);

export default SessionModel;
