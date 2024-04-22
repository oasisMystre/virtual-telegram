import QRCode from "qrcode";
import { Input, Markup, Telegraf } from "telegraf";

import { BotContext } from "../context";
import { getBalance } from "../controllers/wallet.controller";

import { cleanText, readFileSync } from "./utils";
import { DEPOSIT_COMMAND, WALLET_COMMAND } from "./constants";

export default function useWallet(bot: Telegraf<BotContext>) {
  const onWallet = async (ctx: BotContext) => {
    const balance = await getBalance(ctx.wallet);

    await ctx.replyWithMarkdownV2(
      cleanText(
        readFileSync(
          "./src/bot/locale/default/wallet-init.md",
          "utf-8"
        ).replace("%balance%", "♦" + balance)
      ),
      Markup.inlineKeyboard([
        Markup.button.callback("Deposit", DEPOSIT_COMMAND),
      ])
    );
  };

  const onDeposit = async function (ctx: BotContext) {
    const address = ctx.wallet.address;

    const qrCode = await QRCode.toBuffer(address);
    await ctx.replyWithPhoto(Input.fromBuffer(qrCode), {
      caption: readFileSync("./src/bot/locale/default/deposit.md").replace(
        "%address%",
        address
      ),
      parse_mode: "MarkdownV2",
    });
  };

  bot.action(WALLET_COMMAND, onWallet);
  bot.command(WALLET_COMMAND, onWallet);

  bot.action(DEPOSIT_COMMAND, onDeposit);
  bot.command(DEPOSIT_COMMAND, onDeposit);
}
