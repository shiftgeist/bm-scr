import { main } from "./main.ts";

main();

Deno.cron("scrape", { minute: { every: 10 } }, () => main());
