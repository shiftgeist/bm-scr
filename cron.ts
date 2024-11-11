import { main } from "./main.ts";

main();

Deno.cron("scrape", { minute: { every: 30 } }, () => main());
