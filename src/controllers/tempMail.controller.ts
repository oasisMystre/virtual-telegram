import { z } from "zod";
import Mailjs from "@cemalgnlts/mailjs";
import { and, eq } from "drizzle-orm";

import { User } from "../dtos";
import { db } from "../connection";
import { tempMails } from "../schema";
import { GmailNator } from "../lib";
import { EmailOption } from "../lib/gmailnator/model/generate.model";

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
        userId,
        username: data.username,
        password: data.password,
      })
      .onConflictDoUpdate({
        target: [tempMails.userId],
        set: {
          username: data.username,
          password: data.password,
        },
      })
      .returning()
      .execute();

    tempMail = account;
  }

  await mailjs.login(tempMail.username, tempMail.password!);

  return { mailjs, tempMail };
};

export const initializeGmailnator = async function (
  userId: z.infer<typeof User>["id"],
  forceUpdate: boolean = false
) {
  let tempMail = await db.query.tempMails
    .findFirst({
      where: eq(tempMails.userId, userId),
    })
    .execute();

  if (!tempMail || forceUpdate) {
    const { data } = await GmailNator.instance.virtualEmail.generateEmail([
      EmailOption.PUBLIC_DOT_GMAIL,
    ]);

    const [account] = await db
      .insert(tempMails)
      .values({
        userId,
        username: data.email,
      })
      .onConflictDoUpdate({
        target: tempMails.userId,
        set: { username: data.email },
      })
      .returning();

    tempMail = account;
  }

  return tempMail;
};
