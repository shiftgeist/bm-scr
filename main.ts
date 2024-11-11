import { DOMParser } from "jsr:@b-fuze/deno-dom";
import * as log from "jsr:@std/log";
import { parse, stringify } from "jsr:@std/csv";

// Constants
const sheetName = "sheet.csv";
const queryQuality =
  ".pt-0.md\\:pt-24.py-72.md\\:py-36 .grid.grid-cols-2.gap-x-12.list-none";
const columns = [
  "url",
  "name",
  "timestamp",
  "gut",
  "sehr_gut",
  "hervorragend",
  "premium",
];
type IItem = {
  [
    key in (
      | "url"
      | "name"
      | "timestamp"
      | "gut"
      | "sehr_gut"
      | "hervorragend"
      | "premium"
    )
  ]: string;
};

// Setup
log.setup({
  handlers: {
    console: new log.ConsoleHandler("DEBUG"),
    file: new log.FileHandler("DEBUG", {
      filename: "./debug.log",
      formatter: (record) =>
        `${record.datetime.toISOString()}: [${record.levelName}] ${record.msg}`,
    }),
  },
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console", "file"],
    },
    tasks: {
      level: "ERROR",
      handlers: ["console"],
    },
  },
});

// Helper
function getEuros(input: string): string | undefined {
  return input.match(/[\d,]/g)?.join("");
}

async function getSheet() {
  try {
    const res = await Deno.readTextFile(sheetName);
    return parse(res, { columns, separator: ";" });
  } catch (error) {
    log.warn(error);
    await Deno.writeTextFile(
      sheetName,
      stringify([], { columns, separator: ";" }),
    );
    return getSheet();
  }
}

async function putSheet(data: Record<string, unknown>[]) {
  await Deno.writeTextFile(
    sheetName,
    stringify(data, { columns, headers: false, separator: ";" }),
  );
}

// Main
const urls = [
  // S22
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-128-gb-ohne-vertrag/b12fbd31-2d50-4762-ab43-2c9b60475aa6",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-grau-ohne-vertrag/dd462e1e-1dcc-40e0-818d-f9358c5e1459",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-grun-ohne-vertrag/576047be-aeb2-4093-8e53-2e9de49132c7",

  // S22 New Battery
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-128-gb-ohne-vertrag/b12fbd31-2d50-4762-ab43-2c9b60475aa6",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-rosa-ohne-vertrag/c77873a3-111d-4cb0-be49-d3e695e6e916",
  "https://www.backmarket.de/de-de/p/samsung-f-sm-s901bzwde-128-gb-wei-ohne-vertrag/cda72813-4f25-4564-97a3-9de413bba83f",

  // S22 Dual
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-violett-ohne-vertrag/4ccf3e92-091d-4b41-9360-658328d15353",
  "https://www.backmarket.de/de-de/p/samsung-s22-128-gb-schwarz-ohne-vertrag/575510c6-6923-4af9-98cc-40ac222aa577",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-blau-ohne-vertrag/c11fee42-78b1-4128-b069-67fba3533889",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-rosegold-ohne-vertrag/5e66041c-6af1-42c0-816f-46d5519845cd",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-ohne-vertrag/0981fe6c-6862-4922-a830-64f6a921965d",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-wei-ohne-vertrag/8b00ecda-480e-4faa-be03-29ee6a22acff",

  // S22 Dual, New Battery
  "https://www.backmarket.de/de-de/p/samsung-s22-128-gb-schwarz-ohne-vertrag/575510c6-6923-4af9-98cc-40ac222aa577",

  // S22 256 GB
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-grau-ohne-vertrag/67bd1dd0-2fc8-45f8-8a2c-c95508f73583",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-violett-ohne-vertrag/4111c40b-dcd3-43e2-90b4-0a07cd1fb1e1",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-grau-ohne-vertrag/f1fea408-7297-445d-874e-2c0fd1803a11",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-rosegold-ohne-vertrag/b66933c6-8fb3-465d-9191-6f0e2107574f",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-grun-ohne-vertrag/cd123c25-a040-4165-9435-6e95590c05bf",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-wei-ohne-vertrag/b8509f64-384b-4a89-a910-eab6c6244b41",

  // S23 Dual, 256 GB
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-256-gb-ohne-vertrag/c3d5aa6c-60b8-42b0-9b91-8db3f37b61cb",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-violett-ohne-vertrag/8948fafd-fe03-4d2a-9bce-06152a3a929f",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-rosegold-ohne-vertrag/3325c584-a0e6-4a75-93ef-06eb156c6d35",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-grun-ohne-vertrag/40c9c25e-287a-41e6-8c3b-608e9895756b",
  "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-wei-ohne-vertrag/8b2ef740-153c-4a98-a334-c9139043b903",
];

async function handler(url: string): Promise<IItem | undefined> {
  const res = await fetch(
    url,
  );

  const data = await res.text();
  const doc = new DOMParser().parseFromString(data, "text/html");
  const qualityEls = doc.querySelector(queryQuality)?.children;
  const title = doc.querySelector(".heading-1")?.innerText;

  if (!title) {
    log.warn(`No title found for ${url}`);
    return;
  }

  if (qualityEls) {
    const out: Partial<IItem> = {
      url,
      timestamp: new Date().toISOString(),
      name: title,
    };

    const amounts = [];

    for (const quality of qualityEls) {
      const amount = getEuros(quality.innerText);

      if (!amount) {
        log.warn(`No amount found for ${url}`);
        return;
      }

      amounts.push(amount);
    }

    out.gut = amounts[0];
    out.sehr_gut = amounts[1];
    out.hervorragend = amounts[2];
    out.premium = amounts[3];

    log.debug(`${url} ✅`);
    return out;
  } else {
    log.error(`No quality found`);
  }
}

export async function main() {
  log.debug("Booting up");

  const prev = await getSheet();

  if (!prev) {
    log.error(`No sheet found`);
    return;
  }

  const toPromise = urls.map((url) => handler(url));
  const data = await Promise.all(toPromise);
  prev.push(...(data.filter((d) => !!d)));

  await putSheet(prev);

  log.debug("Done");
}
