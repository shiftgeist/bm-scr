import { main } from "./main.ts";

Deno.cron(
  "scrape",
  { minute: { every: 30 } },
  () => main(),
);
