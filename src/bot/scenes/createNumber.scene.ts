import { Composer, Markup, Scenes } from "telegraf";

import { SMSPVA } from "../../lib/smspva";
import { Service, countries } from "../../lib/smspva/config";

import type { BotWizardContext } from "../../context";

import { onOTP, onReject } from "../shared";
import { cleanText, readFileSync } from "../utils";
import {
  CANCEL_ACTION,
  CREATE_EMAIL_WIZARD,
  CREATE_NEW_NUMBER_WIZARD,
  GENERATE_EMAIL_ACTION,
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

  if (value === "cancel") {
    if (ctx.scene.current) ctx.scene.leave();
    if (ctx.scene && ctx.scene.session)
      await ctx.deleteMessages(ctx.scene.session.chats);
    return await ctx.deleteMessage();
  }

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
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Reject",
                callback_data: REJECT_ACTION + data.id + country.code,
              },
              {
                text: "Check OTP",
                callback_data: OTP_ACTION + data.id + country.code,
              },
            ],
            [{ text: "Generate Email", callback_data: GENERATE_EMAIL_ACTION }],
          ],
        },
      }
    );

    mutateChatHistory(ctx, message_id);

    return ctx.wizard.next();
  }

  const activeCountries =
    await SMSPVA.instance.micellenous.getActiveCountries();

  const { message_id } = await ctx.reply(
    "No number available for " + country.name + ". Try another country.",
    Markup.keyboard([
      ["Cancel"],
      ...activeCountries.map(({ flag, name }) => [[name, flag].join(" ")]),
    ]).oneTime()
  );

  mutateChatHistory(ctx, message_id);
};

function createNewNumberWizard() {
  const stepHandler = new Composer<BotWizardContext>();

  stepHandler.action(/^otp/i, onOTP);
  stepHandler.action(/^reject/i, onReject);
  stepHandler.action(
    GENERATE_EMAIL_ACTION,
    async (ctx) => await ctx.scene.enter(CREATE_EMAIL_WIZARD)
  );
  stepHandler.action(CANCEL_ACTION, async (ctx) => await ctx.deleteMessage());

  return new Scenes.WizardScene<BotWizardContext>(
    CREATE_NEW_NUMBER_WIZARD,
    async (ctx) => {
      const countries = await SMSPVA.instance.micellenous.getActiveCountries();

      Markup.keyboard(
        countries.map(({ flag, code, name }) =>
          Markup.button.callback(name + " " + flag, code)
        )
      ).oneTime();

      const { message_id } = await ctx.replyWithMarkdownV2(
        cleanText("Select country of your choice below to generate number."),
        {
          reply_markup: {
            keyboard: [
              ["Cancel"],
              ...countries.map(({ flag, name }) => [[name, flag].join(" ")]),
            ],
            one_time_keyboard: true,
          },
        }
      );

      mutateChatHistory(ctx, message_id);

      return ctx.wizard.next();
    },
    onCreateVirtualNumber,
    stepHandler
  );
}

export const newNumberScene = createNewNumberWizard();
