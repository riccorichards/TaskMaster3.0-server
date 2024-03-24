import mongoose from "mongoose";
import { TaskDocument } from "../type";

const TaskSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.ObjectId, ref: "User" },
    workspace: { type: String, required: true },
    task: { type: String, required: true },
    desc: { type: String, required: true },
    storedTime: { type: Number, default: 0 },
    priority: { type: String, required: true },
    complete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TaskModel = mongoose.model<TaskDocument>("tasks", TaskSchema);

export default TaskModel;
