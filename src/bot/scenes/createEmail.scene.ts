import Mailjs from "@cemalgnlts/mailjs";
import { Composer, Markup, Scenes } from "telegraf";

import { readFileSync } from "../utils";
import { BotWizardContext } from "../../context";
import {
  CHANGE_TEMP_EMAIL_ACTION,
  CREATE_EMAIL_WIZARD,
  DELETE_ACTION,
  MAIL_LIST_ACTION,
  OPEN_ACTION,
} from "../constants";
import { initializeTempMail } from "../../controllers/tempMail.controller";
import { formatIntroMail, formatMail } from "../utils/format";

function createEmailWizard() {
  const stepHandler = new Composer<BotWizardContext>();

  stepHandler.action(CHANGE_TEMP_EMAIL_ACTION, async (ctx) => {
    const _mailjs: Mailjs = ctx.state.mailjs;
    await _mailjs.deleteMe();

    const { tempMail, mailjs } = await initializeTempMail(
      ctx.state.user.id,
      true
    );

    ctx.state.mailjs = mailjs;
    ctx.state.tempMail = tempMail;

    await ctx.deleteMessage();

    await echoEmail(ctx);
  });

  stepHandler.action(MAIL_LIST_ACTION, async (ctx) => {
    /// safe delete previous message list
    // @ts-ignore
    const mailList = ctx.wizard.state.mailList;
    // @ts-ignore
    if (mailList) await ctx.deleteMessages(mailList);

    const mailjs: Mailjs = ctx.state.mailjs;
    const { data } = await mailjs.getMessages();
    const msgs = await Promise.all(
      data.map((message) =>
        ctx.replyWithMarkdownV2(
          formatIntroMail(message),
          Markup.inlineKeyboard([
            Markup.button.callback("🚮 Delete", DELETE_ACTION + message.id),
            Markup.button.callback("🔓 Open", OPEN_ACTION + message.id),
          ])
        )
      )
    );

    // @ts-ignore
    ctx.wizard.state.mailList = msgs.map((msg) => msg.message_id);
  });

  stepHandler.action(/^open/i, async (ctx) => {
    if ("data" in ctx.callbackQuery) {
      const [, id] = ctx.callbackQuery.data.split(/^open/i);
      const mailjs: Mailjs = await ctx.state.mailjs;
      const { data } = await mailjs.getMessage(id);

      await ctx.editMessageText(formatMail(data), {
        parse_mode: "MarkdownV2",
      });
    }
  });

  stepHandler.action(/^delete/, async (ctx) => {
    if ("data" in ctx.callbackQuery) {
      const [, id] = ctx.callbackQuery.data.split(/^delete/i);
      const mailjs: Mailjs = await ctx.state.mailjs;
      await mailjs.deleteMessage(id);

      await ctx.deleteMessage();
    }
  });

  const echoEmail = async (ctx: BotWizardContext) => {
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

  return new Scenes.WizardScene<BotWizardContext>(
    CREATE_EMAIL_WIZARD,
    async (ctx) => {
      await echoEmail(ctx);
      ctx.wizard.next();
    },
    stepHandler
  );
}

export const createEmailScene = createEmailWizard();
