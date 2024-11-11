import { DOMParser } from "jsr:@b-fuze/deno-dom";
import * as log from "jsr:@std/log";
import { parse, ParseOptions, stringify, StringifyOptions } from "jsr:@std/csv";

// Constants
const queryQuality =
  ".pt-0.md\\:pt-24.py-72.md\\:py-36 .grid.grid-cols-2.gap-x-12.list-none";
const statsFileName = "stats.csv";
const historyFileName = "sheet.csv";
const itemColumns = [
  "id",
  "url",
  "name",
  "timestamp",
  "gut",
  "sehr_gut",
  "hervorragend",
  "premium",
];
interface IItem {
  id: string;
  url: string;
  name: string;
  timestamp: string;
  gut: string;
  sehr_gut: string;
  hervorragend: string;
  premium: string;
}

const statsColumns = [
  "id",
  "gut",
  "gut_timestamp",
  "gut_name",
  "gut_url",
  "sehr_gut",
  "sehr_gut_timestamp",
  "sehr_gut_name",
  "sehr_gut_url",
  "hervorragend",
  "hervorragend_timestamp",
  "hervorragend_name",
  "hervorragend_url",
  "premium",
  "premium_timestamp",
  "premium_name",
  "premium_url",
];
interface IStats {
  id: string;
  url: string;
  gut: number;
  gut_timestamp: string;
  gut_name: string;
  gut_url: string;
  sehr_gut: number;
  sehr_gut_timestamp: string;
  sehr_gut_name: string;
  sehr_gut_url: string;
  hervorragend: number;
  hervorragend_timestamp: string;
  hervorragend_name: string;
  hervorragend_url: string;
  premium: number;
  premium_timestamp: string;
  premium_name: string;
  premium_url: string;
}

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
async function timeout(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function getEuros(input: string): string | undefined {
  return input.match(/[\d,]/g)?.join("");
}

async function getCsv(fileName: string, columns: ParseOptions["columns"]) {
  try {
    const res = await Deno.readTextFile(fileName);
    return parse(res, { columns, separator: ";" });
  } catch (error) {
    log.warn(error);
    await timeout(2000);
    await Deno.writeTextFile(
      fileName,
      stringify([], { columns, separator: ";" }),
    );
    return await getCsv(fileName, columns);
  }
}
async function putCsv(
  fileName: string,
  data: Record<string, unknown>[],
  columns?: StringifyOptions["columns"],
) {
  await Deno.writeTextFile(
    fileName,
    stringify(data, {
      columns,
      headers: false,
      separator: ";",
    }),
  );
}

// Main
const UrlList: { [key: string]: string[] } = {
  "S21 Ultra": [
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-ultra-5g-128-gb-silber-ohne-vertrag/9acced0c-c132-4e94-8ef4-56bd2f786de0?l=12&offerType=0#scroll=false",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-ultra-5g-128-gb-schwarz-midgnight-black-ohne-vertrag/eb82c373-e060-4ef3-b246-1f6564ebd8b7?l=12&offerType=0#scroll=false",

    // Dual
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-ultra-5g-128-gb-schwarz-ohne-vertrag/baaa71ad-a044-4422-9820-bf05d5cb3d9f?l=12&offerType=0#scroll=false",
    "https://www.backmarket.de/de-de/p/samsung-sm-g998b-128-gb-ohne-vertrag/414a005b-b279-4bc4-a6d3-d71be36975c9?l=12&offerType=0#scroll=false",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-ultra-5g-128-gb-grau-ohne-vertrag/07b21051-8c2e-4dfb-a8db-550e034ba150?l=12&offerType=0#scroll=false",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-ultra-5g-dual-sim-128-gb-silber-ohne-vertrag/efaa295c-b0d3-4f7a-bb46-d0a4ac74a00d?l=12&offerType=0#scroll=false",
  ],
  "S22": [
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-128-gb-ohne-vertrag/b12fbd31-2d50-4762-ab43-2c9b60475aa6",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-grau-ohne-vertrag/dd462e1e-1dcc-40e0-818d-f9358c5e1459",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-grun-ohne-vertrag/576047be-aeb2-4093-8e53-2e9de49132c7",

    // New Battery
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-128-gb-ohne-vertrag/b12fbd31-2d50-4762-ab43-2c9b60475aa6",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-rosa-ohne-vertrag/c77873a3-111d-4cb0-be49-d3e695e6e916",
    "https://www.backmarket.de/de-de/p/samsung-f-sm-s901bzwde-128-gb-wei-ohne-vertrag/cda72813-4f25-4564-97a3-9de413bba83f",

    // Dual
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-violett-ohne-vertrag/4ccf3e92-091d-4b41-9360-658328d15353",
    "https://www.backmarket.de/de-de/p/samsung-s22-128-gb-schwarz-ohne-vertrag/575510c6-6923-4af9-98cc-40ac222aa577",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-blau-ohne-vertrag/c11fee42-78b1-4128-b069-67fba3533889",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-rosegold-ohne-vertrag/5e66041c-6af1-42c0-816f-46d5519845cd",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-ohne-vertrag/0981fe6c-6862-4922-a830-64f6a921965d",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-128-gb-wei-ohne-vertrag/8b00ecda-480e-4faa-be03-29ee6a22acff",

    // Dual, New Battery
    "https://www.backmarket.de/de-de/p/samsung-s22-128-gb-schwarz-ohne-vertrag/575510c6-6923-4af9-98cc-40ac222aa577",

    // 256 GB
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-grau-ohne-vertrag/67bd1dd0-2fc8-45f8-8a2c-c95508f73583",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-violett-ohne-vertrag/4111c40b-dcd3-43e2-90b4-0a07cd1fb1e1",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-grau-ohne-vertrag/f1fea408-7297-445d-874e-2c0fd1803a11",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-rosegold-ohne-vertrag/b66933c6-8fb3-465d-9191-6f0e2107574f",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-grun-ohne-vertrag/cd123c25-a040-4165-9435-6e95590c05bf",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-wei-ohne-vertrag/b8509f64-384b-4a89-a910-eab6c6244b41",

    // Dual, 256 GB
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-256-gb-ohne-vertrag/c3d5aa6c-60b8-42b0-9b91-8db3f37b61cb",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-violett-ohne-vertrag/8948fafd-fe03-4d2a-9bce-06152a3a929f",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-rosegold-ohne-vertrag/3325c584-a0e6-4a75-93ef-06eb156c6d35",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-grun-ohne-vertrag/40c9c25e-287a-41e6-8c3b-608e9895756b",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-5g-256-gb-wei-ohne-vertrag/8b2ef740-153c-4a98-a334-c9139043b903",
  ],
  "S22 Ultra": [
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-128-gb-schwarz-ohne-vertrag/ebe9c3fe-bc6a-4655-ba31-091ba6888ea4?l=12&offerType=0#scroll=false",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-128-gb-wei-ohne-vertrag/90c2fb25-130f-47a5-8f32-4505d939f747?l=12&offerType=0#scroll=false",

    // Dual
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-128-gb-schwarz-ohne-vertrag/ebec5e0e-c64f-4160-9ac7-473781564600",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-128-gb-violett-ohne-vertrag/2cd66d0c-75cc-44d2-98e6-0f544fb80f87",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-128-gb-grun-ohne-vertrag/8c1c220d-e529-4d14-a85c-530265569ff7",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-128-gb-wei-ohne-vertrag/c7654210-fae5-4b8a-b77c-d43a3cf19c32",

    // 256 GB
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-256-gb-schwarz-ohne-vertrag/09cd8103-206c-4750-88cc-4e4754cf43cc?l=12&offerType=0#scroll=false",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-256-gb-rot-burgundy-red-ohne-vertrag/f6af9b7b-1787-4411-81de-da8fc4a0361b?l=12&offerType=0#scroll=false",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-256-gb-grun-ohne-vertrag/7bf1bcc0-2551-4b70-9f27-7e3ba27d1475?l=12&offerType=0#scroll=false",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-256-gb-wei-ohne-vertrag/d8e5a2b2-e959-4588-bc7b-b03e84812093?l=12&offerType=0#scroll=false",

    // 256 GB, Dual
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-256-gb-schwarz-ohne-vertrag/09b7cb66-2646-463e-932c-8833de286fd6?",
    "https://www.backmarket.de/de-de/p/samsung-sm-s908ds-256-gb-ohne-vertrag/dc6fdc40-3ebb-45b7-9579-264c581238dd",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-256-gb-ohne-vertrag/64317a29-053d-4491-a27d-6a7e11d6aff1",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-256-gb-grun-ohne-vertrag/b3aad73b-302b-4227-bc0a-b95881a65431",
    "https://www.backmarket.de/de-de/p/samsung-f-sm-s908bzwge-256-gb-wei-ohne-vertrag/2b276902-b7a7-4306-9fbd-5d014254e048",
  ],
};

function checkAndMakeStats(history: IItem[]): IStats[] {
  // Convert values to numbers and merge arrays
  const data = history.map((item) => ({
    ...item,
    gut: parseFloat(item.gut.replace(",", ".")),
    sehr_gut: parseFloat(item.sehr_gut.replace(",", ".")),
    hervorragend: parseFloat(item.hervorragend.replace(",", ".")),
    premium: parseFloat(item.premium.replace(",", ".")),
  }));

  // Define groupedData with a specific type to avoid implicit any errors
  const groupedData = data.reduce<Record<string, IItem[]>>((acc, item) => {
    if (!acc[item.id]) {
      acc[item.id] = [];
    }
    acc[item.id].push(item);
    return acc;
  }, {});

  // Get the lowest values for each id along with timestamp, name, and url, formatted for CSV
  const lowestValues = Object.keys(groupedData).map((id) => {
    const entries = groupedData[id];

    const getLowestValue = (quality: keyof IItem) => {
      const minEntry = entries.reduce((min, entry) =>
        (entry[quality]) < (min[quality]) ? entry : min
      );
      return {
        value: minEntry[quality],
        timestamp: minEntry.timestamp,
        name: minEntry.name,
        url: minEntry.url,
      };
    };

    return {
      id,
      url: entries[0].url, // Use the URL of the first entry for the ID

      // Populate fields for each quality
      gut: getLowestValue("gut").value,
      gut_timestamp: getLowestValue("gut").timestamp,
      gut_name: getLowestValue("gut").name,
      gut_url: getLowestValue("gut").url,

      sehr_gut: getLowestValue("sehr_gut").value,
      sehr_gut_timestamp: getLowestValue("sehr_gut").timestamp,
      sehr_gut_name: getLowestValue("sehr_gut").name,
      sehr_gut_url: getLowestValue("sehr_gut").url,

      hervorragend: getLowestValue("hervorragend").value,
      hervorragend_timestamp: getLowestValue("hervorragend").timestamp,
      hervorragend_name: getLowestValue("hervorragend").name,
      hervorragend_url: getLowestValue("hervorragend").url,

      premium: getLowestValue("premium").value,
      premium_timestamp: getLowestValue("premium").timestamp,
      premium_name: getLowestValue("premium").name,
      premium_url: getLowestValue("premium").url,
    };
  });

  return lowestValues;
}

async function handler(id: string, url: string): Promise<IItem | undefined> {
  const res = await fetch(
    url,
  );

  const data = await res.text();
  await timeout(200);
  const doc = new DOMParser().parseFromString(data, "text/html");
  await timeout(200);
  const qualityEls = doc.querySelector(queryQuality)?.children;
  const title = doc.querySelector(".heading-1")?.innerText;

  if (!title) {
    log.warn(`No title found for ${url}`);
    return;
  }

  if (qualityEls) {
    const out: Partial<IItem> = {
      id,
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

    log.debug(`${out.timestamp} ${url} ✅`);
    return out as IItem;
  } else {
    log.error(`No quality found ${qualityEls}`);
  }
}

export async function main() {
  log.debug("Booting up");

  const history = await getCsv(historyFileName, itemColumns);
  let stats = await getCsv(statsFileName, statsColumns);

  for (const product of Object.keys(UrlList)) {
    const urls = UrlList[product];

    const toPromise = urls.map((url) => handler(product, url));
    const data = await Promise.all(toPromise);
    history.push(...(data.filter((d) => !!d)));

    stats = [
      ...stats.slice(0, 1),
      ...checkAndMakeStats(history.slice(1)),
    ];
  }

  await putCsv(historyFileName, history, itemColumns);
  await putCsv(statsFileName, stats, statsColumns);

  log.debug("Done");
}
