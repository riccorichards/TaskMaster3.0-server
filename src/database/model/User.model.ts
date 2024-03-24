import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserDocument } from "../type";

//model for mongodb (user schema)
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    picture: { type: String },
    journeyDuration: { type: String, default: null },
    allocatedTime: { type: Number, default: 0 },
  },
  { timestamps: true }
);

//before we save the user's docs we are checking user's password
UserSchema.pre("save", async function (next) {
  const user = this;

  if (!user?.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(13);
    const hash = await bcrypt.hash(user?.password, salt);

    user.password = hash;
    return next();
  } catch (error: any) {
    return next(this.errors);
  }
});

UserSchema.methods.comparePass = async function (
  incomingPassword: string
): Promise<boolean> {
  try {
    const user = this as UserDocument;
    const isMatch = await bcrypt.compare(incomingPassword, user.password);
    return isMatch;
  } catch (error: any) {
    return false;
  }
};

const UserModel = mongoose.model<UserDocument>("User", UserSchema);

export default UserModel;
