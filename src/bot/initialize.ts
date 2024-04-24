import { ethers } from "ethers";

import { BotContext, BotWizardContext } from "../context";
import { findOrCreateUser } from "../controllers/user.controller";
import { initializeTempMail } from "../controllers/tempMail.controller";

export const initializeState = async (
  ctx: BotContext | BotWizardContext,
  next: () => Promise<void>
) => {
  const from = ctx.from!;
  const { user, wallet } = await findOrCreateUser({
    id: from.id.toString(),
    firstName: from.first_name,
    lastName: from.last_name,
    username: from.username!,
  });


  const etherWallet = new ethers.Wallet(
    wallet.privateKey,
    new ethers.JsonRpcProvider(
      "https://mainnet.infura.io/v3/8184cb052a034f8bae2fbadfd6675dcc"
    )
  );

  const {tempMail, mailjs} = await initializeTempMail(user.id);

  ctx.state.user = user;
  ctx.state.tempMail = tempMail;
  ctx.state.mailjs = mailjs;
  ctx.state.wallet = etherWallet;

  /// @ts-ignore
  ctx.user = user;
    /// @ts-ignore
  ctx.wallet = etherWallet;

  await next();
};
