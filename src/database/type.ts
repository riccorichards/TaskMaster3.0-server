import mongoose from "mongoose";

//map tree model type
export interface NodeTreeType {
  username: string;
  node: string;
  path: string;
}

export interface NodeDocument extends NodeTreeType {
  _id: mongoose.Schema.Types.ObjectId;
}

//user model type
export interface UserInput {
  username: string;
  email: string;
  password: string;
  journeyDuration: string | null;
  allocatedTime: number;
}

export interface UserDocument extends UserInput {
  _id: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  picture: string;
  comparePass(incomingPassword: string): Promise<boolean>;
}

//session model type
export interface SessionDocument extends mongoose.Document {
  user: UserDocument["_id"];
  valid: boolean;
  userAgent: string;
  createAt: Date;
  updateAt: Date;
}

//task model type
export interface TaskDocument {
  _id: string;
  author: mongoose.Schema.Types.ObjectId;
  workspace: string;
  task: string;
  desc: string;
  storedTime: number;
  priority: string;
  complete: boolean;
  createdAt: Date;
  updatedAt: string;
}

export interface BotRoleInput {
  user: string;
  role: string;
}

export interface BotRoleDocument extends BotRoleInput {
  _id: mongoose.Schema.Types.ObjectId;
}

export interface BotMsgInput {
  user: string;
  question: string;
  role: string;
}

export interface BotMsgDocument extends BotMsgInput {
  _id: mongoose.Schema.Types.ObjectId;
}

export interface GoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export interface UpsertUser {
  email: string;
  username: string;
  picture: string;
}
