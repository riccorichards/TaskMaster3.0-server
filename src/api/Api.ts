import { Application, NextFunction, Request, Response } from "express";
import Service from "../services/Service";
import { incomingDataValidation } from "./middleware/incomingDataValidation";
import {
  CreateNodeSchema,
  ReadNodeSchema,
  UpdateNodeSchema,
} from "./middleware/zodSchemas/NoteTreeZodSchema";
import { ZodError } from "zod";
import { deserializeUser } from "./middleware/deserializedUser/deselializedUser";
import { requestUser } from "./middleware/deserializedUser/requestUser";
import {
  LoginUserSchema,
  NewJourneySchema,
  RegisterUserSchema,
} from "./middleware/zodSchemas/UserAuthZodSchema";
import {
  CreateTaskSchema,
  DeleteTaskSchema,
  UpdateTaskSchema,
} from "./middleware/zodSchemas/TaskZodSchema";
import config from "../../config";

const Api = (app: Application) => {
  const service = new Service();

  app.get("/", async (req: Request, res: Response) => {
    return res.json({ msg: "Everything looks good..." });
  });

  //register
  app.post(
    "/api/register",
    incomingDataValidation(RegisterUserSchema), //validate incoming data
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await service.RegisterService(req.body);
        return res.status(201).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );

  //login
  app.post(
    "/api/login",
    incomingDataValidation(LoginUserSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await service.LoginService(
          req.body,
          req.get("user-agent") || ""
        );

        return res.status(201).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  //Oauth with google
  app.get(
    "/api/session/oauth/google",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const code = req.query.code as string;
        const response = await service.AuthWithGoogleOauth(
          { code },
          req.get("user-agent") || ""
        );

        if (response) {
          const { accessToken, refreshToken } = response;
          res.setHeader(
            "Access-Control-Allow-Origin",
            "https://task-master3-0.vercel.app"
          );
          res.setHeader("Access-Control-Allow-Credentials", "true");

          res.cookie("accessToken", accessToken, {
            maxAge: 3.154e10,
            httpOnly: true,
            path: "/",
            sameSite: "none",
            secure: true,
          });

          res.cookie("refreshToken", refreshToken, {
            maxAge: 3.154e10,
            httpOnly: true,
            path: "/",
            sameSite: "none",
            secure: true,
          });

          return res.redirect(`${config.origin}/dashboard/overview`);
        }
      } catch (error) {
        next(error);
      }
    }
  );
  //after this line each request needs user authentication
  app.use([deserializeUser, requestUser]);

  //retrieve the user's info when the page was refreshed...
  app.get(
    "/api/find-me",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = res.locals.user.user;
        const response = await service.FindMeService(userId);
        return res.status(200).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );

  app.put(
    "/api/new-journey",
    incomingDataValidation(NewJourneySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = res.locals.user.user;
        const response = await service.NewjourneyService(userId, req.body);

        return res.status(201).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  // api endpoint for create root node
  app.post(
    "/api/node-tree",
    incomingDataValidation(CreateNodeSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await service.CreateNewNodeService(req.body);
        return res.status(201).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  // api endpoint for insert node inside already existing node
  app.post(
    "/api/insert-node",
    incomingDataValidation(CreateNodeSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await service.InsertNodeService(req.body);
        return res.status(201).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  // api endpoint for finding the entire nodes based on provided username
  app.get(
    "/api/nodes/:username",
    incomingDataValidation(ReadNodeSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { username } = req.params;
        const response = await service.RetrieveNodesService({ username });
        return res.status(200).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  // api endpoint for retrieves existing nodes' name based on provided username
  app.get(
    "/api/nodes-name/:username",
    incomingDataValidation(ReadNodeSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { username } = req.params;
        const response = await service.RetrieveNodeNamesService({ username });

        return res.status(200).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  // api endpoint for update notes (update // remove)
  app.put(
    "/api/update-node",
    incomingDataValidation(UpdateNodeSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await service.UpdateNodeService(req.body);
        return res.status(201).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  //api endpoint for create task
  app.post(
    "/api/task",
    incomingDataValidation(CreateTaskSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const author = res.locals.user.user;
        const response = await service.CreateTaskService(req.body, author);
        return res.status(201).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          console.log({ error });
          return res.status(404).json({ err: error });
        }
        next(error);
      }
    }
  );
  //api endpoint for read author's tasks
  app.get(
    "/api/task",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const author = res.locals.user.user;
        const response = await service.ReadTasksService(author);
        return res.status(201).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  //api endpoint for read author's tasks
  app.put(
    "/api/task/:taskId",
    incomingDataValidation(UpdateTaskSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { taskId } = req.params;
        const response = await service.UpdateTaskService(
          {
            taskId,
          },
          req.body
        );
        return res.status(201).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  //api endpoint for delete task
  app.delete(
    "/api/task/:taskId",
    incomingDataValidation(DeleteTaskSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { taskId } = req.params;
        const response = await service.DeleteTaskService({ taskId });
        return res.status(201).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  //api endpoint for day finish (store daily tasks in the history)
  app.post(
    "/api/day-finish",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const author = res.locals.user.user;
        const response = await service.DayFinishService(author);
        if (response) return res.status(201).json(response.reverse());
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  //api endpoint for filter history
  app.get(
    "/api/filter-history",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const author = res.locals.user.user;
        if (Object.keys(req.query).length === 0)
          return res
            .status(400)
            .json({ error: "No filter criteria provided." });

        const query = Object.entries(req.query)[0];
        const [field, value] = query;

        if (typeof field !== "string" || typeof value !== "string") {
          return res.status(400).json({ error: "Invalid filter criteria." });
        }

        const response = await service.FilterHistoryService(
          author,
          field,
          value
        );
        return res.status(201).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  //api endpoint for retrieve history
  app.get(
    "/api/day-finish",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const author = res.locals.user.user;
        const amount =
          typeof req.query.amount === "string" ? req.query.amount : "";

        const response = await service.GetDayFinishService(author, amount);
        return res.status(201).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  //api endpoint for retrieve daily result based on user's history
  app.get(
    "/api/daily-result",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const author = res.locals.user.user;
        const response = await service.DailyResulyService(author);
        return res.status(200).json(response.reverse());
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  //api endpoint for retrieve users' stats
  app.get(
    "/api/my-stats",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = res.locals.user.user;
        const response = await service.MyStatsService(userId);
        return res.status(200).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  //api endpoint for retrieve top workspaces
  app.get(
    "/api/top-workspaces",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = res.locals.user.user;
        const response = await service.TopLearnedTopicsService(userId);
        return res.status(200).json(response);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
  // interaction with bot
  app.get(
    "/api/bot-message",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = res.locals.user.user;
        const cmd = typeof req.query.cmd === "string" ? req.query.cmd : "";
        const role = typeof req.query.role === "string" ? req.query.role : "";
        const input = {
          cmd,
          userId,
          role,
        };
        const response = await service.BotMessageService(input);
        return res.status(200).json(response);
      } catch (error) {
        next(error);
      }
    }
  );
  //create bot
  app.post(
    "/api/create-bot",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = res.locals.user.user;
        const response = await service.CreateBotRoleService({
          user: userId,
          role: req.body.role,
        });
        return res.status(201).json(response);
      } catch (error) {
        next(error);
      }
    }
  );

  //retrieve bots' roles
  app.get(
    "/api/bot",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = res.locals.user.user;
        const response = await service.GetBotRoleService(userId);
        return res.status(201).json(response);
      } catch (error) {
        next(error);
      }
    }
  );

  //remove bots' roles
  app.delete(
    "/api/bot/:botId",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { botId } = req.params;
        const response = await service.RemoveBotRoleService(botId);
        return res.status(201).json(response);
      } catch (error) {
        next(error);
      }
    }
  );

  //search bot roles based provided query "name"
  app.get(
    "/api/search-bot",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = res.locals.user.user;
        const botQuery =
          typeof req.query.role === "string" ? req.query.role : "";
        const response = await service.SearchBotRoleService(botQuery, userId);
        return res.status(201).json(response);
      } catch (error) {
        next(error);
      }
    }
  );

  //logs out
  app.get(
    "/api/log-out",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        return res.status(201).json(null);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(404).json({ err: error.message });
        }
        next(error);
      }
    }
  );
};

export default Api;
