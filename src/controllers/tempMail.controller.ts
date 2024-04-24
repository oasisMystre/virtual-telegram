import Mailjs from "@cemalgnlts/mailjs";
import { eq } from "drizzle-orm";

import { db } from "../connection";
import { tempMails } from "../schema";
import { z } from "zod";
import { User } from "@/dtos";

export const initializeTempMail = async function (
  userId: z.infer<typeof User>["id"],
  forceUpdate = false
) {
  const mailjs = new Mailjs();

  let tempMail = await db.query.tempMails
    .findFirst({
      where: eq(tempMails.userId, userId),
    })
    .execute();

  if (!tempMail || forceUpdate) {
    const { data } = await mailjs.createOneAccount();
    const [account] = await db
      .insert(tempMails)
      .values({
        id: tempMail?.id,
        userId,
        username: data.username,
        password: data.password,
      })
      .onConflictDoUpdate({
        target: [tempMails.id],
        set: {
          userId,
          username: data.username,
          password: data.password,
        },
      })
      .returning()
      .execute();

    tempMail = account;
  }

  await mailjs.login(tempMail.username, tempMail.password);

  return {mailjs, tempMail};
};
