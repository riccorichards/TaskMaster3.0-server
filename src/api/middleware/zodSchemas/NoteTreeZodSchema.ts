import { TypeOf, object, string } from "zod";

const payload = {
  body: object({
    username: string().min(1, { message: "Username is required!" }).trim(),
    node: string().min(1, { message: "Node is required!" }).trim(),
    path: string().min(1, { message: "Path is required!" }).trim(),
  }),
};

const updatePayload = {
  body: object({
    username: string().min(1, { message: "Username is required!" }).trim(),
    node: string().min(1, { message: "Node is required!" }).trim(),
    updatedNodeName: string().trim().optional(),
    method: string().trim(),
  }),
};

const params = {
  params: object({
    username: string().min(1, {
      message: "Username is required to find nodes!",
    }),
  }),
};

export const CreateNodeSchema = object({ ...payload });
export const ReadNodeSchema = object({ ...params });
export const UpdateNodeSchema = object({ ...updatePayload });

export type CreateNodeType = TypeOf<typeof CreateNodeSchema>;
export type ReadNodeType = TypeOf<typeof ReadNodeSchema>;
export type UpdateNodeType = TypeOf<typeof UpdateNodeSchema>;
