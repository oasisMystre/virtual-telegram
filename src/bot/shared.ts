import { SMSPVA } from "../lib/smspva";
import { Service } from "../lib/smspva/config";
import { BotWizardContext } from "../context";
import { updateVirtualNumber } from "../controllers/virtualNumber.controller";

import { readFileSync } from "./utils";
import { CREATE_NEW_NUMBER_WIZARD } from "./constants";

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
