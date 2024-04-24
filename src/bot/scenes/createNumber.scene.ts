import { Composer, Markup, Scenes } from "telegraf";

import { SMSPVA } from "../../lib/smspva";
import { Service } from "../../lib/smspva/config";
import countries from "../../lib/smspva/config/countries";

import type { BotWizardContext } from "../../context";

import { onOTP, onReject } from "../shared";
import { cleanText, readFileSync } from "../utils";
import {
  CREATE_NEW_NUMBER_WIZARD,
  OTP_ACTION,
  REJECT_ACTION,
} from "../constants";

import { createCharge } from "../../controllers/charge.controller";
import { createVirtualNumber } from "../../controllers/virtualNumber.controller";

const mutateChatHistory = (ctx: BotWizardContext, chat: number) => {
  const chats = (ctx.scene.session.chats ?? []) as number[];
  chats.push(chat);
  ctx.scene.session.chats = chats;
  return chat;
};

const onCreateVirtualNumber = async (ctx: BotWizardContext) => {
  const echoInvalidMessage = () =>
    ctx.reply("Please enter a valid country code.");

  const message = ctx.message!;
  const wallet = null as any;
  const service = Service.TELEGRAM;

  if (!("text" in message)) return echoInvalidMessage();

  const value = message.text.toLowerCase();
  const country = countries.find(({ code, name }) => {
    return code.toLowerCase() === value || value.includes(name.toLowerCase());
  });

  if (!country) return echoInvalidMessage();

  const [charge] = await createCharge({
    service,
    country,
    wallet,
  });

  const { data } = await SMSPVA.instance.virtualNumber.getNumber({
    service,
    country: country.code,
  });

  if (data.number) {
    await createVirtualNumber({
      chargeId: charge.id,
      id: data.id.toString(),
      jsonData: JSON.stringify(data),
      userId: ctx.from!.id.toString(),
    });

    const { message_id } = await ctx.replyWithMarkdownV2(
      readFileSync("./src/bot/locale/default/phone-generated.md").replace(
        "%phone_number%",
        data.CountryCode + data.number
      ),
      Markup.inlineKeyboard([
        Markup.button.callback(
          "Reject",
          REJECT_ACTION + data.id + country.code
        ),
        Markup.button.callback(
          "Check OTP",
          OTP_ACTION + data.id + country.code
        ),
      ])
    );

    mutateChatHistory(ctx, message_id);

    return ctx.wizard.next();
  }

  await ctx.reply(
    "No number available for " + country.name + ". Try another country.",
    Markup.keyboard(
      countries.map(({ flag, code, name }) =>
        Markup.button.callback(name + " " + flag, code)
      )
    ).oneTime()
  );
};

function createNewNumberWizard() {
  const stepHandler = new Composer<BotWizardContext>();

  stepHandler.action(/^otp/i, onOTP);

  stepHandler.action(/^reject/i, onReject);

  return new Scenes.WizardScene<BotWizardContext>(
    CREATE_NEW_NUMBER_WIZARD,
    async (ctx) => {
      const { message_id } = await ctx.replyWithMarkdownV2(
        cleanText("Select country of your choice below to generate number."),
        Markup.keyboard(
          countries.map(({ flag, code, name }) =>
            Markup.button.callback(name + " " + flag, code)
          )
        ).oneTime()
      );

      mutateChatHistory(ctx, message_id);

      return ctx.wizard.next();
    },
    onCreateVirtualNumber,
    stepHandler
  );
}

export const newNumberScene = createNewNumberWizard();
