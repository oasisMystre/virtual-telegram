import { SMSPVA } from "../src/lib/smspva";
import { Service } from "../src/lib/smspva/config";
import { db } from "../src/connection";
import { virtualNumbers } from "../src/schema";

async function main() {
  // const response = await SMSPVA.instance.virtualNumber.getSMS({
  //   id: "149716923",
  //   country: "HU",
  //   service: Service.TELEGRAM,
  // })

  // console.log(response.data)

  // const response = await SMSPVA.instance.virtualNumber.denyNumber({
  //   country: "UK",
  //   service: Service.TELEGRAM,
  //   id: "149034929"
  // });

  // console.log(response.data);

  // await Promise.all(
  //   (
  //     await db.select().from(virtualNumbers)
  //   ).map((r) =>
  //     SMSPVA.instance.virtualNumber.denyNumber({
  //       id: r.id,
  //       // @ts-ignore
  //       country: r.jsonData.country,
  //       service: Service.TELEGRAM,
  //     })
  //   )
  // );

  // await db.delete(virtualNumbers).execute()

  const response =await SMSPVA.instance.micellenous.getActiveCountries();
  console.log(JSON.stringify(response))
}

main().catch(console.log);