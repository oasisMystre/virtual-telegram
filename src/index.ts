import "dotenv/config";
import fastify from "fastify";
import cors from "@fastify/cors";
import { Telegraf } from "telegraf";

import { registerBot } from "./bot";
import type { BotContext } from "./context";

type MainParams = {
  accessToken: string;
  port: number;
  host: string;
};

export async function main({ host, port, accessToken }: MainParams) {
  const app = fastify({
    logger: true,
    ignoreTrailingSlash: true,
    ignoreDuplicateSlashes: true,
  });

  app.register(cors, {
    origin: "*",
  });

  const bot = new Telegraf<BotContext>(accessToken);

  const longRunProcess: Promise<any>[] = [];

  if ("RENDER_EXTERNAL_HOSTNAME" in process.env) {
    const webhook = await bot.createWebhook({
      domain: process.env.RENDER_EXTERNAL_HOSTNAME!,
    });

    app.post(`/telegraf/${bot.secretPathComponent()}`, webhook as any);
  } else {
    longRunProcess.push(bot.launch().then(() => console.log("Bot running...")));
  }

  registerBot(bot);

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  longRunProcess.push(
    app
      .listen({ port, host })
      .then(() => console.log(`app listening at port ${port}`))
  );

  await Promise.all(longRunProcess);
}

main({
  host: process.env.HOST!,
  port: Number(process.env.PORT!),
  accessToken: process.env.TELEGRAM_ACCESS_TOKEN!,
}).catch(console.log);
