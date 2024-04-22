import { Markup, Scenes } from "telegraf";
import type { Chat } from "telegraf/typings/core/types/typegram";

import { SMSPVA } from "../../lib/smspva";
import { Service } from "../../lib/smspva/config";
import countries from "../../lib/smspva/config/countries";

import type { BotWizardContext } from "../../context";
import type { VirtualNumber } from "../../lib/smspva/models";

import { cleanText, readFileSync } from "../utils";
import {
  CREATE_NEW_NUMBER_WIZARD,
  OTP_ACTION,
  REJECT_ACTION,
} from "../constants";

import { createCharge } from "../../controllers/charge.controller";
import {
  createVirtualNumber,
  updateVirtualNumber,
} from "../../controllers/virtualNumber.controller";

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

    ctx.scene.session.virtualNumber = data;

    const { message_id } = await ctx.replyWithMarkdownV2(
      readFileSync("./src/bot/locale/default/phone-generated.md").replace(
        "%phone_number%",
        data.CountryCode + data.number
      ),
      Markup.inlineKeyboard([
        Markup.button.callback("Reject", REJECT_ACTION),
        Markup.button.callback("Check OTP", OTP_ACTION),
      ])
    );

    mutateChatHistory(ctx, message_id);

    return;
  }

  await ctx.reply(
    "No number available for " + country.name + ". Try another country."
  );
};

const onRejectNumber = async (ctx: BotWizardContext) => {
  /// insert delete code here
  const virtualNumber = ctx.scene.session.virtualNumber as VirtualNumber;
  const id = virtualNumber.id.toString();

  const { data } = await SMSPVA.instance.virtualNumber.denyNumber({
    id: virtualNumber.id.toPrecision(),
    service: Service.TELEGRAM,
    country: virtualNumber.country,
  });

  await updateVirtualNumber(id, {
    jsonData: JSON.stringify(data),
  });

  const chats = ctx.scene.session.chats;

  await ctx.deleteMessages([...chats]);
  ctx.scene.session.chats = [];

  return ctx.scene.reenter();
};

const onCheckOTP = async (ctx: BotWizardContext) => {
  /// insert otp check code here
  const virtualNumber = ctx.scene.session.virtualNumber as VirtualNumber;
  const { data } = await SMSPVA.instance.virtualNumber.getSMS({
    id: virtualNumber.id.toString(),
    service: Service.TELEGRAM,
    country: virtualNumber.country,
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
};

function createNewNumberWizard() {
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
    async (ctx) => {
      const callbackQuery = ctx.callbackQuery;
      if (callbackQuery && "data" in callbackQuery) {
        if (callbackQuery.data === OTP_ACTION) return onCheckOTP(ctx);
        else if (callbackQuery.data === REJECT_ACTION)
          return onRejectNumber(ctx);
      }

      await onCreateVirtualNumber(ctx);
    }
  );
}

export const newNumberScene = createNewNumberWizard();
