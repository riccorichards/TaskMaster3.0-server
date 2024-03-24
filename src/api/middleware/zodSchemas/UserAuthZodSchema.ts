import { TypeOf, number, object, string } from "zod";

const registerPayload = {
  body: object({
    username: string().min(1, { message: "Username is required" }).trim(),
    email: string().email("Invalid email format!"),
    password: string()
      .min(8, {
        message: "Password is too short - Should be 8 chars minimum...",
      })
      .trim(),
  }),
};

const loginPayload = {
  body: object({
    email: string().email("Invalid email format!"),
    password: string()
      .min(8, {
        message: "Password is too short - Should be 8 chars minimum...",
      })
      .trim(),
  }),
};

const newjourneyPayload = {
  body: object({
    journeyDuration: string(),
    allocatedTime: number(),
  }),
};

export const RegisterUserSchema = object({ ...registerPayload });
export const LoginUserSchema = object({ ...loginPayload });
export const NewJourneySchema = object({ ...newjourneyPayload });

export type RegisterUserType = TypeOf<typeof RegisterUserSchema>;
export type LoginUserType = TypeOf<typeof LoginUserSchema>;
export type NewJourneyType = TypeOf<typeof NewJourneySchema>;
