import mongoose from "mongoose";
import { NodeDocument } from "../type";

const NodeTreeSchema = new mongoose.Schema({
  username: { type: String, required: true },
  node: { type: String, required: true },
  path: { type: String },
});

const NodeModel = mongoose.model<NodeDocument>("nodeTree", NodeTreeSchema);

export default NodeModel;
