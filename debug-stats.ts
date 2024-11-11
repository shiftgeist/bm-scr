import { checkAndMakeStats, getHistory, getStats, putStats } from "./main.ts";
import { assertNotEquals } from "jsr:@std/assert";

const history = await getHistory();
let stats = await getStats();

stats = [...stats.slice(0, 1), ...checkAndMakeStats(history.slice(1))];

for (const item of stats) {
  assertNotEquals(item.gut, NaN, item.gut_name);
  assertNotEquals(item.sehr_gut, NaN, item.sehr_gut_name);
  assertNotEquals(item.hervorragend, NaN, item.hervorragend_name);
  assertNotEquals(item.premium, NaN, item.premium_name);
}

await putStats(stats);

console.log(stats);
