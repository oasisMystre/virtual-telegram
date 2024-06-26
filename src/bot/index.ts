import { Markup, Scenes, session, type Telegraf } from "telegraf";

import { onOTP, onReject } from "./shared";
import type { BotContext } from "../context";
import { findOrCreateUser } from "../controllers/user.controller";

import { cleanText, readFileSync } from "./utils";
import { initializeState } from "./initialize";
import { newNumberScene } from "./scenes/createNumber.scene";
import {
  CREATE_NEW_NUMBER_WIZARD,
  CREATE_VIRTUAL_NUMBER_ACTION,
} from "./constants";

const echoMessage = async (ctx: BotContext) => {
  await ctx.replyWithMarkdownV2(
    readFileSync("./src/bot/locale/default/start.md"),
    Markup.inlineKeyboard([
      Markup.button.callback("Create Number", CREATE_VIRTUAL_NUMBER_ACTION),
    ])
  );
};

const echoHelp = async (ctx: BotContext) => {
  await ctx.replyWithMarkdownV2(
    readFileSync("./src/bot/locale/default/help.md")
  );
};

const echoVerify = async (ctx: BotContext) => {
  await ctx.replyWithMarkdownV2(
    cleanText(
      readFileSync("./src/bot/locale/default/join-group.md", "utf-8").replace(
        "%link%",
        process.env.TELEGRAM_GROUP!
      )
    ),
    Markup.inlineKeyboard([
      Markup.button.url("Join group", process.env.TELEGRAM_GROUP!),
    ])
  );
};

const onCreate = async (ctx: BotContext) => {
  // if (ctx.chat?.type !== "private") return;

  // if (ctx.user.isVerified)
  return await ctx.scene.enter(CREATE_NEW_NUMBER_WIZARD);
  // await echoVerify(ctx);
};

export const registerBot = function (bot: Telegraf<BotContext>) {
  const scenes = [newNumberScene];
  const stage = new Scenes.Stage(scenes);

  scenes.map((scene) => scene.use(initializeState));

  bot.use(session());
  bot.use(stage.middleware());

  bot.use(initializeState);

  bot.telegram.setMyCommands(
    [
      {
        command: "start",
        description: "Start or upgrade the bot to the latest version",
      },
      {
        command: "phone",
        description: "Create a new virtual number",
      },
      {
        command: "email",
        description: "Generate and change assign temp mail",
      },
      {
        command: "help",
        description: "Show altsgenerateBot help",
      },
      {
        command: "socials",
        description: "Show our socials and website",
      },
    ],
    { scope: { type: "all_private_chats" } }
  );

  bot.start(echoMessage);
  bot.help(echoHelp);

  bot.hears("phone", onCreate);
  bot.command("phone", onCreate);
  bot.action("phone", onCreate);

  /// Virtual number actions
  bot.action(/^otp/i, onOTP);
  bot.action(/^reject/i, onReject);

  bot.on("new_chat_members", async (ctx, next) => {
    await Promise.all(
      ctx.message.new_chat_members.map((member) =>
        findOrCreateUser({
          isVerified: true,
          id: member.id.toString(),
          firstName: member.first_name,
          lastName: member.last_name,
          username: member.username,
        })
      )
    );

    await initializeState(ctx, next);
  });

  return bot;
};
