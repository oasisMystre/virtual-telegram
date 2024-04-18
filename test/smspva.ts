import { SMSPVA } from "../src/lib/smspva";
import { Service } from "../src/lib/smspva/config";

async function main() {
  const response = await SMSPVA.instance.virtualNumber.denyNumber({
    country: "UK",
    service: Service.TELEGRAM,
    id: "149034929"
  });

  console.log(response.data);
}

main().catch(console.log);
