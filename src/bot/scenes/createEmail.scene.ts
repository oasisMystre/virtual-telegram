import Mailjs from "@cemalgnlts/mailjs";
import { Composer, Markup, Scenes } from "telegraf";

import { readFileSync } from "../utils";
import { BotWizardContext } from "../../context";
import {
  CHANGE_TEMP_EMAIL_ACTION,
  CREATE_EMAIL_WIZARD,
  DELETE_ACTION,
  MAIL_LIST_ACTION,
  OPEN_ACTION,
} from "../constants";
import { initializeTempMail } from "../../controllers/tempMail.controller";
import { formatIntroMail, formatMail } from "../utils/format";
import { echoEmail, onChange, onDelete, onInbox, onOpen } from "../shared";

function createEmailWizard() {
  const stepHandler = new Composer<BotWizardContext>();

  stepHandler.action(MAIL_LIST_ACTION, onInbox);
  stepHandler.action(CHANGE_TEMP_EMAIL_ACTION, onChange);

  stepHandler.action(/^open/i, onOpen);
  stepHandler.action(/^delete/, onDelete);

  return new Scenes.WizardScene<BotWizardContext>(
    CREATE_EMAIL_WIZARD,
    async (ctx) => {
      await echoEmail(ctx);
      ctx.wizard.next();
    },
    stepHandler
  );
}

export const createEmailScene = createEmailWizard();
