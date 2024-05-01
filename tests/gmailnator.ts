import { GmailNator } from "../src/lib";
import { EmailOption } from "../src/lib/gmailnator/model/generate.model";

async function main() {
  //   const response = await GmailNator.instance.virtualEmail.generateEmail([
  //     EmailOption.PUBLIC_DOT_GMAIL,
  //   ]);

    const response = await GmailNator.instance.virtualEmail.getInbox({
      email: "ez.ra.m.e.ur.a@gmail.com",
      limit: 10,
    });

  // const response = await GmailNator.instance.virtualEmail.getMessage({
  //   id: "eyJpdiI6IndybzE2SHNDN01Qa0N0RVpoTm5yQ3c9PSIsInZhbHVlIjoiYmpTVElVbHpYSVIyYWR6QTdMNit4S2dEbG9PbzBoOC90Qk1HbUh2T3BzVjJUdjN2OTVBTHgrbGxoUGlZcEVTRUZnbktUSHBTeDBmL1p3R09sUVFqeDhCdG9MQ1k4QUswWldXZ1lGclRINTg9IiwibWFjIjoiMmNmNDAyZDg5NGU0YTczMzc4YmFiMjdjNzBiZDhhYzU3NzVmNmVlMWE2ZTExNDhmNTczNTQ2NDYyZmU5NDIwNSJ9",
  // });

  console.log(response.data);
}

main().catch(console.log);
