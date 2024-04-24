import { ethers } from "ethers";
import Mailjs from "@cemalgnlts/mailjs";

import type { z } from "zod";
import { Context, Scenes } from "telegraf";

import type { User } from "./dtos";
import type { WizardSessionData } from "telegraf/scenes";

export type BotContext = {
  user: z.infer<typeof User>;
  wallet: ethers.Wallet;
} & Context &
  Scenes.WizardContext;

export type BotWizardSessionData = WizardSessionData & Record<string, any>;

export type BotWizardContext = Scenes.WizardContext<BotWizardSessionData>;

export type BotWizardState = {
  mailjs: Mailjs;
  wallet: ethers.Wallet;
  user: z.infer<typeof User>;
};
