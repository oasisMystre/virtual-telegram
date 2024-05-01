import { Markup } from "telegraf";
import Mailjs from "@cemalgnlts/mailjs";

import { GmailNator } from "../lib";
import { SMSPVA } from "../lib/smspva";
import { Service } from "../lib/smspva/config";
import { BotWizardContext } from "../context";
import {
  initializeGmailnator,
  initializeTempMail,
} from "../controllers/tempMail.controller";
import { updateVirtualNumber } from "../controllers/virtualNumber.controller";

import { readFileSync } from "./utils";
import { formatIntroMail, formatMail } from "./utils/format";
import {
  CHANGE_TEMP_EMAIL_ACTION,
  CREATE_NEW_NUMBER_WIZARD,
  DELETE_ACTION,
  MAIL_LIST_ACTION,
  OPEN_ACTION,
} from "./constants";

export const onOTP = async (ctx: BotWizardContext) => {
  const callbackQuery = ctx.callbackQuery!;
  if ("data" in callbackQuery) {
    const [id, country] = callbackQuery.data
      .split(/^otp(\d+)/i)
      .filter(Boolean);
    const { data } = await SMSPVA.instance.virtualNumber.getSMS({
      id,
      /// @ts-ignore
      country,
      service: Service.TELEGRAM,
    });

    if (data.sms) {
      await ctx.replyWithMarkdownV2(
        readFileSync("./src/bot/locale/default/otp-recieved.md").replace(
          "%sms%",
          data.sms ?? data.text
        )
      );

      await ctx.editMessageReplyMarkup(undefined);
      return await ctx.scene.leave();
    }

    return await ctx.reply(
      "No SMS found! Wait some moment or check if you used the correct number."
    );
  }
};

export const onReject = async (ctx: BotWizardContext) => {
  const callbackQuery = ctx.callbackQuery!;

  if ("data" in callbackQuery) {
    const [id, country] = callbackQuery.data.split(/^reject(\d+)/i);

    const { data } = await SMSPVA.instance.virtualNumber.denyNumber({
      id,
      // @ts-ignore
      country,
      service: Service.TELEGRAM,
    });

    await updateVirtualNumber(id, {
      jsonData: JSON.stringify(data),
    });

    const chats = ctx.scene.session.chats;
    if (chats && chats.length > 0) await ctx.deleteMessages([...chats]);
    else await ctx.deleteMessage();
    ctx.scene.session.chats = [];

    return ctx.scene.enter(CREATE_NEW_NUMBER_WIZARD);
  }
};

export const echoEmail = async (ctx: BotWizardContext) => {
  await ctx.replyWithMarkdownV2(
    readFileSync("./src/bot/locale/default/email-start.md").replace(
      "%email_address%",
      ctx.state.tempMail.username
    ),
    Markup.inlineKeyboard([
      Markup.button.callback("📥 Inbox", MAIL_LIST_ACTION),
      Markup.button.callback("🔄 Change", CHANGE_TEMP_EMAIL_ACTION),
    ])
  );
};

export const onInbox = async (ctx: BotWizardContext) => {
  /// safe delete previous message list
  if (ctx.wizard) {
    // @ts-ignore
    const mailList = ctx.wizard.state.mailList;
    if (mailList) await ctx.deleteMessages(mailList);
  }

  const { data } = await GmailNator.instance.virtualEmail.getInbox({
    email: ctx.state.tempMail.username,
    limit: 5,
  });

  if (data.length === 0) return await ctx.reply("No mail found in inbox.");

  const msgs = await Promise.all(
    data.map((message) =>
      ctx.replyWithMarkdownV2(
        formatIntroMail(message),
        Markup.inlineKeyboard([
          //  Markup.button.callback("🚮 Delete", DELETE_ACTION + message.id),
          //   Markup.button.callback("🔓 Open", OPEN_ACTION + message.id),
        ])
      )
    )
  );

  if (ctx.wizard)
    // @ts-ignore
    ctx.wizard.state.mailList = msgs.map((msg) => msg.message_id);
};

export const onChange = async (ctx: BotWizardContext) => {
  const _mailjs: Mailjs = ctx.state.mailjs;
  await _mailjs.deleteMe();

  const tempMail = await initializeGmailnator(ctx.state.user.id, true);

  ctx.state.tempMail = tempMail;

  await ctx.deleteMessage();

  await echoEmail(ctx);
};

export const onOpen = async (ctx: BotWizardContext) => {
  const callbackQuery = ctx.callbackQuery!;

  if ("data" in callbackQuery) {
    const [id] = callbackQuery.data.split(/^open/i).filter(Boolean);
    const { data } = await GmailNator.instance.virtualEmail.getMessage({
      id,
    });

    await ctx.editMessageText(formatMail(data), {
      parse_mode: "MarkdownV2",
    });
  }
};

export const onDelete = async (ctx: BotWizardContext) => {
  const callbackQuery = ctx.callbackQuery!;
  if ("data" in callbackQuery) {
    const [, id] = callbackQuery.data.split(/^delete/i);
    const mailjs: Mailjs = await ctx.state.mailjs;
    await mailjs.deleteMessage(id);

    await ctx.deleteMessage();
  }
};
