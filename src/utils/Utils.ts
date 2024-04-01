import config from "../../config";
import { help } from "../const";
import { GoogleUserResult, NodeDocument } from "../database/type";
import { ApiError } from "./Error";
import axios from "axios";
import qs from "qs";

class Utils {
  static defineAbsolutePath(nodes: NodeDocument[], path: string) {
    const findNode = nodes.find((node) => node.node === path);

    if (!findNode) return false;

    const newPath = findNode.path + `${findNode.node}` + "/";
    return newPath;
  }

  static buildHierarchy = (nodes: NodeDocument[]) => {
    const findChildren = (parentPath: string): any => {
      return nodes
        .filter((node) => node.path === parentPath)
        .map((node) => ({
          name: node.node,
          children: findChildren(parentPath + node.node + "/"),
        }));
    };

    const hierarchy = findChildren(`/`);

    return hierarchy;
  };

  static capitalized(str: string) {
    const firstChar = str.charAt(0).toUpperCase();
    return firstChar + str.slice(1);
  }

  static extractDate(createdAt: string) {
    const date = new Date(createdAt);
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");

    return `${month}/${day}`;
  }

  static defineRemainDays(period: string, startDay: Date) {
    console.log({ period, startDay });

    const endTime = new Date(period);
    const today = new Date();
    const start = new Date(startDay);

    //normalize both days at the start of the day
    endTime.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    //define the difference between target day and today in milleseconds
    const differentInTime = endTime.getTime() - today.getTime();
    const journeyDuration = endTime.getTime() - start.getTime();
    //convert milleseconds into days
    const differenceInDays = Math.ceil(differentInTime / (1000 * 3600 * 24));
    const journeyDurationDays = Math.ceil(journeyDuration / (1000 * 3600 * 24));
    const usedDays = journeyDurationDays - differenceInDays;

    const result = ((usedDays / journeyDurationDays) * 100).toFixed(2);
    return { result, differenceInDays };
  }

  static generateHelpString(
    commands: { id: number; command: string; describe: string }[]
  ): string {
    return commands
      .map(
        (cmd) =>
          `#$%Command ==> ${cmd.command}#$%Description ==> ${cmd.describe}`
      )
      .join("\n\n");
  }

  static botInteraction(cmd: string, argument?: any) {
    let response: { author: string; msg: string } = { author: "bot", msg: "" };
    if (cmd === "") {
      response.msg =
        "Hi, I'm Matthew, I'm here to check our knowledge. For more instructions, please type 'help'.";
      return response;
    } else if (cmd === "help") {
      response.msg = this.generateHelpString(help);
      return response;
    } else if (argument === "new") {
      response.msg = `Thanks for adding new question into my memory.`;
      return response;
    } else if (cmd === "finish") {
      response.msg = `I guess you are tired, let's finish...`;
      return response;
    } else if (cmd === "not found") {
      response.msg = `Question was not found...`;
      return response;
    } else {
      response.msg = "Sorry, I can not response...";
      return response;
    }
  }

  static async getGoogleOauthToken({ code }: { code: string }) {
    const url = config.googleOauthTokenUrl;

    const value = {
      code,
      client_id: config.googleClientID,
      client_secret: config.googleClientSecret,
      redirect_uri: config.googleRedirectURI,
      grant_type: "authorization_code",
    };

    try {
      const { data } = await axios.post(url, qs.stringify(value), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return data;
    } catch (error: any) {
      console.log(error.response.data.error);
      throw new ApiError(error.response.data.error);
    }
  }

  static async getGoogleUser({
    id_token,
    access_token,
  }: {
    id_token: string;
    access_token: string;
  }): Promise<GoogleUserResult> {
    try {
      const res = await axios.get<GoogleUserResult>(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      );
      return res.data;
    } catch (error: any) {
      throw new ApiError(error.message);
    }
  }
}

export default Utils;
