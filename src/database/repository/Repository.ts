import {
  CreateNodeType,
  UpdateNodeType,
} from "../../api/middleware/zodSchemas/NoteTreeZodSchema";
import {
  CreateTaskType,
  DeleteTaskType,
  UpdateTaskType,
} from "../../api/middleware/zodSchemas/TaskZodSchema";
import {
  NewJourneyType,
  RegisterUserType,
} from "../../api/middleware/zodSchemas/UserAuthZodSchema";
import { NotFoundError } from "../../utils/Error";
import BotMsgModel from "../model/BotMsg.model";
import BotRoleModel from "../model/BotRole.model";
import HistoryModel from "../model/History.model";
import NodeModel from "../model/NodeTree.model";
import SessionModel from "../model/Session.model";
import TaskModel from "../model/Task.model";
import UserModel from "../model/User.model";
import { BotRoleInput, TaskDocument, UpsertUser } from "../type";

class Repository {
  async Register(input: RegisterUserType["body"]) {
    const newUser = await UserModel.create({
      ...input,
      journeyDuration: null,
    });
    return await newUser.save();
  }

  async FindUserByEmail(email: string) {
    return await UserModel.findOne({ email });
  }

  async CreateSession(userId: string, userAgent: string) {
    const newSession = await SessionModel.create({
      user: userId,
      userAgent,
    });
    return await newSession.save();
  }

  async FindMe(id: string) {
    return await UserModel.findById(id);
  }

  async NewJourney(id: string, input: NewJourneyType["body"]) {
    return await UserModel.findByIdAndUpdate(id, input, {
      new: true,
    });
  }

  async RetrieveNodeName(username: string) {
    const nodes = await NodeModel.find({ username });
    return nodes.map((node) => node.node);
  }

  async CreateNode(input: CreateNodeType["body"]) {
    return await NodeModel.create(input);
  }

  async InsertNode(input: CreateNodeType["body"]) {
    return await NodeModel.create(input);
  }

  async RetrieveNodes(username: string) {
    return await NodeModel.find({ username });
  }

  async RemoveNodeAndSubNodes(username: string, node: string) {
    const removeNode = await NodeModel.findOneAndDelete({ username, node });

    const regex = new RegExp(`/${node}/`);

    const removeNodeSubnodes = await NodeModel.deleteMany({
      username,
      path: { $regex: regex },
    });

    return { removeNode, removeNodeSubnodes };
  }

  async UpdateNode(input: UpdateNodeType["body"]) {
    const { username, node, updatedNodeName } = input;

    const updatedNode = await NodeModel.findOneAndUpdate(
      { username, node },
      { $set: { node: updatedNodeName } },
      { new: true }
    );

    const regexUpdate = new RegExp(`/${node}/`);

    const subNodes = await NodeModel.find({
      username,
      path: { $regex: regexUpdate },
    });

    for (const subNode of subNodes) {
      const newPath = subNode.path.replace(`/${node}/`, `/${updatedNodeName}/`);
      await NodeModel.updateOne(
        { _id: subNode._id },
        {
          $set: { path: newPath },
        }
      );
    }

    return { updatedNode };
  }

  async CreateTask(input: CreateTaskType["body"], author: string) {
    const task = await TaskModel.create({ ...input, author });
    return await task.save();
  }

  async ReadTasks(author: string) {
    return await TaskModel.find({ author }).sort({ createdAt: -1 });
  }

  async UpdateTask(
    id: UpdateTaskType["params"],
    input: UpdateTaskType["body"]
  ) {
    const { taskId } = id;
    return await TaskModel.findByIdAndUpdate(taskId, input, {
      new: true,
    });
  }

  async DeleteTask(input: DeleteTaskType["params"]) {
    const { taskId } = input;
    return await TaskModel.findByIdAndDelete(taskId);
  }

  async DayFinish(author: string) {
    const dailyTasks = await TaskModel.find({ author });
    if (dailyTasks.length === 0) {
      return [];
    }

    await Promise.all(
      dailyTasks.map(async (dailyTask: TaskDocument) => {
        const {
          _id,
          updatedAt,
          author,
          workspace,
          complete,
          storedTime,
          task,
          priority,
        } = dailyTask;

        await HistoryModel.create({
          createdAt: updatedAt,
          author,
          workspace,
          complete,
          storedTime,
          task,
          priority,
        });

        await TaskModel.findByIdAndDelete(_id);
      })
    );

    return await HistoryModel.find({ author });
  }

  async GetDayFinish(author: string, amount: string) {
    return await HistoryModel.find({ author })
      .sort({ createdAt: -1 })
      .limit(amount === "all" ? Infinity : 10);
  }

  async FilterHistory(query: any) {
    return await HistoryModel.find(query).sort({ createdAt: -1 });
  }

  async NewQuestionForBot(userId: string, question: string, role: string) {
    return await BotMsgModel.create({ user: userId, msg: question, role });
  }

  async GetQuestionFromBotMemory(userId: string, role: string) {
    return await BotMsgModel.aggregate([
      { $match: { user: userId, role } },
      { $sample: { size: 1 } },
    ]);
  }

  async FindAndUpdateUser(email: string, input: UpsertUser, options: {}) {
    return await UserModel.findOneAndUpdate({ email }, input, {
      ...options,
      returnDocument: "after",
    });
  }

  async CreateBot(input: BotRoleInput) {
    return await BotRoleModel.create(input);
  }

  async GetBots(userId: string) {
    return await BotRoleModel.find({ user: userId });
  }

  async SearchBot(query: any) {
    return await BotRoleModel.find(query);
  }

  async RemoveBot(botId: string) {
    const removedBot = await BotRoleModel.findByIdAndDelete(botId);

    await BotMsgModel.deleteMany({ role: removedBot?.role });

    return removedBot;
  }
}

export default Repository;
