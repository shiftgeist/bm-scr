import { handler } from "./main.ts";

const fileName =
  "/debug/no-amount-found-2024-11-11T20-42-28-735Z-https---www-backmarket-de-de-de-p-samsung-f-sm-s908bzwge-256-gb-wei-ohne-vertrag-2b276902-b7a7-4306-9fbd-5d014254e048.html";
const fileData = await Deno.readTextFile(import.meta.dirname + fileName);

const out = await handler("ABC", "example.org", fileData);

console.log(out);
