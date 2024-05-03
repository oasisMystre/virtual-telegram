import { SMSPVA } from "../src/lib/smspva";
import { Service } from "../src/lib/smspva/config";

async function main() {
  const response = await SMSPVA.instance.virtualNumber.getNumber({
    country: "US",
    service: Service.TELEGRAM,
  })

  // console.log(JSON.stringify(response.data))

  // const response = await SMSPVA.instance.virtualNumber.denyNumber({
  //   orderId: "149716923"
  // });

  // console.log(JSON.stringify(response.data));

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

  // const response =await SMSPVA.instance.micellenous.getActiveCountries();
  // console.log(JSON.stringify(response))
}

main().catch(console.log);
