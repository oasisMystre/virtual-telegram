import Mailjs from "@cemalgnlts/mailjs";
import { cleanText, readFileSync } from ".";
import { VirtualEmail } from "@/lib/gmailnator/virtualEmail";

export const formatMail = (
  props: Awaited<ReturnType<VirtualEmail["getMessage"]>>["data"]
) => {
  return cleanText(
    readFileSync("./src/bot/locale/default/mail.md", "utf-8")
      .replace("%from%", props.from)
      .replace("%subject%", props.subject)
      .replace("%intro%", props.content)
  );
};

export const formatIntroMail = (
  props: Awaited<ReturnType<VirtualEmail["getInbox"]>>["data"][number]
) => {
  return cleanText(
    readFileSync("./src/bot/locale/default/mail.md", "utf-8")
      .replace("%from%", props.from)
      .replace("%subject%", props.subject)
      .replace("%intro%", "Not supported")
  );
};
