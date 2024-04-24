import {
  CreateNodeType,
  ReadNodeType,
  UpdateNodeType,
} from "../api/middleware/zodSchemas/NoteTreeZodSchema";
import {
  CreateTaskType,
  DeleteTaskType,
  UpdateTaskType,
} from "../api/middleware/zodSchemas/TaskZodSchema";
import {
  LoginUserType,
  NewJourneyType,
  RegisterUserType,
} from "../api/middleware/zodSchemas/UserAuthZodSchema";
import Repository from "../database/repository/Repository";
import { BotRoleInput } from "../database/type";
import {
  ApiError,
  AuthorisedError,
  BadRequestError,
  NotFoundError,
} from "../utils/Error";
import Utils from "../utils/Utils";
import { signWithJWT } from "../utils/jwt";

class Service {
  private Repo: Repository;
  constructor() {
    this.Repo = new Repository();
  }

  async RegisterService(input: RegisterUserType["body"]) {
    try {
      const newUser = await this.Repo.Register(input);
      if (!newUser) throw new BadRequestError("something wents wrong...");
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  async LoginService(input: LoginUserType["body"], userAgent: string) {
    const { email, password } = input;
    const user = await this.Repo.FindUserByEmail(email);
    if (!user) throw new AuthorisedError("wrong credentials");
    const validPassword = await user.comparePass(password);
    if (!validPassword) throw new AuthorisedError("wrong credentials");
    const newSession = await this.Repo.CreateSession(
      user._id.toString(),
      userAgent
    );

    const accessToken = signWithJWT(
      {
        user: newSession.user,
        session: newSession._id,
      },
      { expiresIn: 86400 }
    ); //day

    const refreshToken = signWithJWT(
      {
        user: newSession.user,
        session: newSession._id,
      },
      { expiresIn: 86400 * 30 }
    ); //month

    return { accessToken, refreshToken, newSession };
  }

  async AuthWithGoogleOauth({ code }: { code: string }, userAgent: string) {
    const { id_token, access_token } = await Utils.getGoogleOauthToken({
      code,
    });
    const googleUser = await Utils.getGoogleUser({ id_token, access_token });

    if (!googleUser.verified_email)
      throw new AuthorisedError("Google account is not verified");

    const user = await this.Repo.FindAndUpdateUser(
      googleUser.email,
      {
        email: googleUser.email,
        username: googleUser.name,
        picture: googleUser.picture,
      },
      {
        upsert: true,
        new: true,
      }
    );

    if (user && user._id) {
      const newSession = await this.Repo.CreateSession(
        user._id.toString(),
        userAgent
      );

      const accessToken = signWithJWT(
        {
          user: newSession.user,
          session: newSession._id,
        },
        { expiresIn: 86400 }
      ); //day

      const refreshToken = signWithJWT(
        {
          user: newSession.user,
          session: newSession._id,
        },
        { expiresIn: 86400 * 30 }
      ); //month

      return { accessToken, refreshToken };
    }
  }

  async FindMeService(id: string) {
    const user = await this.Repo.FindMe(id);
    if (!user)
      throw new NotFoundError("User was not found with provided ID: " + id);
    return user;
  }

  async NewjourneyService(id: string, input: NewJourneyType["body"]) {
    return this.Repo.NewJourney(id, input);
  }

  async CreateNewNodeService(input: CreateNodeType["body"]) {
    const newNode = await this.Repo.CreateNode(input);
    if (!newNode) throw new BadRequestError("bad request or server issue");
    const nodeNames = await this.Repo.RetrieveNodeName(input.username);
    if (nodeNames.length < 1)
      throw new NotFoundError("data was not found or data is not available");
    const nodes = await this.Repo.RetrieveNodes(input.username);
    const nodeTree = Utils.buildHierarchy(nodes)[0];
    return {
      nodeTree,
      nodeNames,
    };
  }

  async InsertNodeService(input: CreateNodeType["body"]) {
    const { username, node, path } = input;
    const nodes = await this.Repo.RetrieveNodes(input.username);
    if (nodes.length === 0)
      throw new NotFoundError("data was not found or data is not available");

    const newAbsolutePath = Utils.defineAbsolutePath(nodes, path);

    if (!newAbsolutePath)
      throw new BadRequestError("nodes' path was not found");

    const newNode = {
      username,
      node,
      path: newAbsolutePath,
    };
    const insertedNode = await this.Repo.InsertNode(newNode);
    if (!insertedNode) throw new BadRequestError("bad request");

    const nodeNames = await this.Repo.RetrieveNodeName(username);
    const updatedNodeTree = await this.Repo.RetrieveNodes(input.username);
    const nodeTree = Utils.buildHierarchy(updatedNodeTree)[0];
    return {
      nodeTree,
      nodeNames,
    };
  }

  async RetrieveNodesService(input: ReadNodeType["params"]) {
    const { username } = input;
    const nodes = await this.Repo.RetrieveNodes(username);
    return Utils.buildHierarchy(nodes)[0];
  }

  async RetrieveNodeNamesService(input: ReadNodeType["params"]) {
    try {
      const { username } = input;
      return this.Repo.RetrieveNodeName(username);
    } catch (error) {
      throw error;
    }
  }

  async UpdateNodeService(input: UpdateNodeType["body"]) {
    const { username, node, method } = input;
    let nodeNames;
    let nodeTree;

    if (method === "remove") {
      const { removeNode, removeNodeSubnodes } =
        await this.Repo.RemoveNodeAndSubNodes(username, node);

      if (!removeNode || !removeNodeSubnodes)
        throw new BadRequestError(
          "bad request with removing nodes and its sub nodes"
        );
      nodeNames = await this.Repo.RetrieveNodeName(username);
      const nodes = await this.Repo.RetrieveNodes(username);
      nodeTree = Utils.buildHierarchy(nodes)[0];
    } else if (method === "update") {
      const { updatedNode } = await this.Repo.UpdateNode(input);

      if (!updatedNode)
        throw new BadRequestError("bad request with updating node");
      nodeNames = await this.Repo.RetrieveNodeName(username);
      const nodes = await this.Repo.RetrieveNodes(username);
      nodeTree = Utils.buildHierarchy(nodes)[0];
    }

    return {
      nodeTree,
      nodeNames,
    };
  }

  async CreateTaskService(input: CreateTaskType["body"], author: string) {
    return this.Repo.CreateTask(input, author);
  }

  async ReadTasksService(author: string) {
    return this.Repo.ReadTasks(author);
  }

  async UpdateTaskService(
    taskId: UpdateTaskType["params"],
    input: UpdateTaskType["body"]
  ) {
    return this.Repo.UpdateTask(taskId, input);
  }

  async DeleteTaskService(taskId: DeleteTaskType["params"]) {
    return this.Repo.DeleteTask(taskId);
  }

  async DayFinishService(author: string) {
    return this.Repo.DayFinish(author);
  }

  async GetDayFinishService(author: string, amount: string) {
    const history = await this.Repo.GetDayFinish(author, amount);
    if (history.length === 0) {
      return [];
    } else if (!history) {
      throw new NotFoundError("Error while retrieve user's history");
    }
    return history;
  }

  async FilterHistoryService(
    author: string,
    field: string,
    originValue: string
  ) {
    const intArray = ["1", "0"];

    let value:
      | number
      | boolean
      | { $regex: string; $options: string }
      | string = originValue;

    if (intArray.includes(originValue)) {
      value = parseInt(originValue, 10);
      if (value < 2) {
        value = Boolean(value);
      }
    } else {
      value =
        field === "workspace"
          ? { $regex: Utils.capitalized(value as string), $options: "i" }
          : { $regex: value, $options: "i" };
    }

    let query: { [key: string]: any } = { author };
    query[field] = value;

    return this.Repo.FilterHistory(query);
  }

  async DailyResulyService(author: string) {
    const history = await this.Repo.GetDayFinish(author, "all");
    if (history.length === 0) {
      return [];
    } else if (!history) {
      throw new NotFoundError("Error while retrieve user's history");
    }

    // Create a map to group tasks by date
    const groupedTasks = new Map();

    // Populate the map with tasks grouped by date
    for (const task of history) {
      const date = Utils.extractDate(task.createdAt?.toString() || ""); // Get only the date portion
      const existingTasks = groupedTasks.get(date) || [];
      groupedTasks.set(date, [...existingTasks, task]);
    }

    // Calculate the completion percentage for each group
    const result = Array.from(groupedTasks).map(([date, dailyTasks]) => {
      const doneTasks = dailyTasks.filter((task: any) => task.complete).length;
      return {
        date,
        value: (doneTasks / dailyTasks.length) * 100,
      };
    });

    return result;
  }

  async MyStatsService(userId: string) {
    const profile = await this.Repo.FindMe(userId);

    if (!profile)
      throw new NotFoundError("user was not ound with provided ID: " + userId);
    let remainingDays;
    let usedTime;
    let perDay;
    if (profile.journeyDuration && profile.allocatedTime) {
      const history = (await this.Repo.GetDayFinish(userId, "all")) as {
        storedTime: number;
        createdAt: Date;
      }[];

      if (history.length === 0) {
        return [];
      } else if (!history) {
        throw new NotFoundError("Error while retrieve user's history");
      }

      const totalWorkingHours = history.reduce(
        (acc, task) => acc + task.storedTime!,
        0
      );

      remainingDays = Utils.defineRemainDays(
        profile.journeyDuration,
        history[history.length - 1].createdAt
      ).result;
      usedTime = (totalWorkingHours / (profile.allocatedTime * 3600)) * 100;
      perDay =
        (profile.allocatedTime - totalWorkingHours / 3600) /
        Utils.defineRemainDays(
          profile.journeyDuration,
          history[history.length - 1].createdAt || ""
        ).differenceInDays;
    }

    return { remainingDays, usedTime, perDay };
  }

  async TopLearnedTopicsService(userId: string) {
    const history = await this.Repo.GetDayFinish(userId, "all");

    if (history.length === 0) {
      return [];
    } else if (!history) {
      throw new NotFoundError("Error while retrieve user's history");
    }

    const groupedTasks = new Map<any, any>();

    for (const task of history) {
      const workspace = task.workspace;
      const existingEntry = groupedTasks.get(workspace) || {
        tasks: [],
        totalStoredTime: 0,
        completeTasks: 0,
      };
      existingEntry.tasks.push(task);
      existingEntry.totalStoredTime += task.storedTime;
      if (task.complete) {
        existingEntry.completeTasks += 1;
      }

      groupedTasks.set(workspace, existingEntry);
    }

    const result: { name: string; value: number }[] = [];

    groupedTasks.forEach((value, key) => {
      const totalTasks = value.tasks.length * 0.04;
      const totalStoredTime = value.totalStoredTime * 0.035;
      const completionRate =
        (value.completeTasks / value.tasks.length) * 100 * 0.025;

      result.push({
        name: key,
        value: (totalStoredTime + totalTasks + completionRate) / 15,
      });
    });

    return result.sort((a, b) => b.value - a.value).slice(0, 10);
  }

  async BotMessageService({
    cmd,
    userId,
    role,
  }: {
    cmd: string;
    userId: string;
    role: string;
  }) {
    const argument = cmd.split(":")[0];
    if (argument !== "new" && cmd !== "question") {
      return Utils.botInteraction(cmd);
    }

    const newRegaxedItems = /^new:\s*(.+)$/;

    if (newRegaxedItems.test(cmd)) {
      const matched = cmd.match(newRegaxedItems);
      if (matched) {
        const [, question] = matched;
        const response = await this.Repo.NewQuestionForBot(
          userId,
          question,
          role
        );
        if (!response)
          throw new NotFoundError("Error while adding new question");
        return Utils.botInteraction(cmd, argument);
      }
    } else if (cmd === "question") {
      const response = await this.Repo.GetQuestionFromBotMemory(userId, role);

      if (!response || response.length === 0)
        return Utils.botInteraction("not found");
      const question = {
        author: "bot",
        msg: response[0].msg,
      };
      return question;
    }
  }

  async CreateBotRoleService(input: BotRoleInput) {
    const newRole = await this.Repo.CreateBot(input);
    if (!newRole)
      throw new BadRequestError("Error while creating new bot's role");

    return newRole;
  }

  async GetBotRoleService(userId: string) {
    const roles = await this.Repo.GetBots(userId);
    if (!roles) {
      throw new BadRequestError("Error while retrieving bots roles");
    } else if (roles.length < 1) return [];
    return roles;
  }

  async SearchBotRoleService(botQuery: string, userId: string) {
    const query = { user: userId, role: { $regex: botQuery, $options: "i" } };
    const roles = await this.Repo.SearchBot(query);
    if (!roles) {
      throw new BadRequestError("Error while retrieving bots roles");
    } else if (roles.length < 1) return [];
    return roles;
  }

  async RemoveBotRoleService(botId: string) {
    const removedBot = await this.Repo.RemoveBot(botId);
    if (!removedBot)
      throw new BadRequestError("Error while removing bot's role");

    return removedBot;
  }
}

export default Service;
