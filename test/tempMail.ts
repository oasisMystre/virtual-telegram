import MailJs from "@cemalgnlts/mailjs";
import { initializeTempMail } from "../src/controllers/tempMail.controller";

async function main() {
  const [mailjs, login] = await initializeTempMail("6061617258");
  console.log((await mailjs.me()).data)
}

main().catch(console.log);