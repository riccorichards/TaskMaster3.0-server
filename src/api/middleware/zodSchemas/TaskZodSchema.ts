import { TypeOf, boolean, number, object, string } from "zod";

const payload = {
  body: object({
    workspace: string().min(1, { message: "Workspace is required" }).trim(),
    task: string().min(1, { message: "Task is required" }).trim(),
    desc: string().min(1, { message: "Desc is required" }).trim(),
    storedTime: number(),
    priority: string().min(1, { message: "Priority is required" }).trim(),
    complete: boolean(),
  }),
};

const params = {
  params: object({
    taskId: string().min(1, { message: "task ID is required" }),
  }),
};

const updateParams = {
  body: object({
    storedTime: number(),
    complete: boolean(),
  }),
};

export const CreateTaskSchema = object({ ...payload });
export const ReadTaskSchema = object({ ...params });
export const UpdateTaskSchema = object({ ...params, ...updateParams });
export const DeleteTaskSchema = object({ ...params });

export type CreateTaskType = TypeOf<typeof CreateTaskSchema>;
export type ReadTaskType = TypeOf<typeof ReadTaskSchema>;
export type UpdateTaskType = TypeOf<typeof UpdateTaskSchema>;
export type DeleteTaskType = TypeOf<typeof DeleteTaskSchema>;
