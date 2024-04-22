import { ethers } from "ethers";
import { Markup, Scenes, session, type Telegraf } from "telegraf";

import type { BotContext } from "../context";
import {
  CREATE_NEW_NUMBER_WIZARD,
  CREATE_VIRTUAL_NUMBER_ACTION,
  //WALLET_COMMAND,
} from "./constants";
//import useWallet from "./wallet";
import { newNumberScene } from "./scenes/createNumber.scene";
import { findOrCreateUser } from "../controllers/user.controller";
import { readFileSync } from "./utils";

const echoMessage = async (ctx: BotContext) => {
  await ctx.replyWithMarkdownV2(
    readFileSync("./src/bot/locale/default/start.md"),
    Markup.inlineKeyboard([
      //Markup.button.callback("Wallet", WALLET_COMMAND),
      Markup.button.callback("Create Number", CREATE_VIRTUAL_NUMBER_ACTION),
    ])
  );
};

const echoHelp = async (ctx: BotContext) => {
  await ctx.replyWithMarkdownV2(
    readFileSync("./src/bot/locale/default/help.md")
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
    const { user, wallet } = await findOrCreateUser({
      id: from.id.toString(),
      firstName: from.first_name,
      lastName: from.last_name,
      username: from.username!,
    });

    ctx.user = user;
    ctx.wallet = new ethers.Wallet(
      wallet.privateKey,
      new ethers.JsonRpcProvider(
        "https://mainnet.infura.io/v3/8184cb052a034f8bae2fbadfd6675dcc"
      )
    );

    await next();
  });

  bot.telegram.setMyCommands([
    {
      command: "start",
      description: "Start or upgrade the bot to the latest version",
    },
    {
      command: "wallet",
      description: "Check wallet balance and topup",
    },
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
  bot.action("create", onCreate);
  bot.command("help", echoHelp);
  bot.hears("help", echoHelp);
  bot.action("help", echoHelp);

  /// useWallet(bot);

  return bot;
};
