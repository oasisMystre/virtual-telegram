import Mailjs from "@cemalgnlts/mailjs";
import { cleanText, readFileSync } from ".";

export const formatMail = (
  props: Awaited<ReturnType<Mailjs["getMessage"]>>["data"]
) => {
  return cleanText(
    readFileSync("./src/bot/locale/default/mail.md", "utf-8")
      .replace("%from%", props.from.address)
      .replace("%subject%", props.subject)
      .replace("%intro%", props.html.join("\n"))
  );
};

export const formatIntroMail = (
  props: Awaited<ReturnType<Mailjs["getMessages"]>>["data"][number]
) => {
  return cleanText(
    readFileSync("./src/bot/locale/default/mail.md", "utf-8")
      .replace("%from%", props.from.address)
      .replace("%subject%", props.subject)
      .replace("%intro%", props.intro)
  );
};
