import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.ObjectId, ref: "User" },
  workspace: { type: String },
  task: { type: String },
  storedTime: { type: Number },
  complete: { type: Boolean },
  priority: { type: String },
  createdAt: { type: Date },
});

const HistoryModel = mongoose.model("history", HistorySchema);

export default HistoryModel;
