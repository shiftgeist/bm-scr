import { main } from "../lib/main.ts";

main();

Deno.cron("scrape", { hour: { every: 1 } }, () => main());
