import { Markup, Scenes, session, type Telegraf } from "telegraf";

import type { BotContext } from "../context";
import {
  CREATE_NEW_NUMBER_WIZARD,
  CREATE_VIRTUAL_NUMBER_ACTION,
} from "./constants";
import { newNumberScene } from "./scenes/createNumber.scene";
import { findOrCreateUser } from "../controllers/user.controller";

const echoMessage = async (ctx: BotContext) => {
  await ctx.reply(
    "Welcome to Virtual Telegram Bot. Get a virtual number to register a telegram account. \n\n Select an action to continue!",
    Markup.inlineKeyboard([
      Markup.button.callback(
        "Create Virtual Number",
        CREATE_VIRTUAL_NUMBER_ACTION
      ),
    ])
  );
};

const onCreate = async (ctx: BotContext) => {
  await ctx.scene.enter(CREATE_NEW_NUMBER_WIZARD);
};

export const registerBot = function (bot: Telegraf<BotContext>) {
  const stage = new Scenes.Stage([newNumberScene]);

  bot.use(session());
  bot.use(stage.middleware());

  bot.use(async (ctx, next) => {
    const from = ctx.from!;
    const [user] = await findOrCreateUser({
      id: from.id.toString(),
      firstName: from.first_name,
      lastName: from.last_name,
      username: from.username!,
    });
    ctx.user = user;

    await next();
  });

  bot.telegram.setMyCommands([
    {
      command: "create",
      description: "Create a new virtual number",
    },
    {
      command: "help",
      description: "Show help",
    },
    {
      command: "socials",
      description: "Show our social media handles and website",
    },
  ]);

  bot.start(echoMessage);

  bot.hears("create", onCreate);
  bot.command("create", onCreate);

  return bot;
};
