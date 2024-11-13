import { DOMParser, type HTMLCollection } from "jsr:@b-fuze/deno-dom";
import * as log from "jsr:@std/log";
import { resolve } from "jsr:@std/path";
import {
  DataItem,
  parse,
  ParseOptions,
  stringify,
  StringifyOptions,
} from "jsr:@std/csv";

// Types
interface IItem {
  id: string;
  url: string;
  name: string;
  timestamp: string;
  gut?: string;
  sehr_gut?: string;
  hervorragend?: string;
  premium?: string;
}

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

// Constants
const CONFIG = {
  queryQuality:
    ".pt-0.md\\:pt-24.py-72.md\\:py-36 .grid.grid-cols-2.gap-x-12.list-none",
  statsFileName: "stats.csv",
  historyFileName: "history.csv",
  cooldownTime: 60000,
  botCooldownTime: 7200000,
  errorCooldownTime: 300000,
  debugDir: resolve(import.meta.dirname!, "../../debug"),
} as const;

const itemColumns = [
  "id",
  "url",
  "name",
  "timestamp",
  "gut",
  "sehr_gut",
  "hervorragend",
  "premium",
] as const;

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
] as const;

const UrlList: { [key: string]: string[] } = {
  S21: [
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-128-gb-grau-ohne-vertrag/15ad458f-c997-4391-ac91-0fa85a007129",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-128-gb-violett-ohne-vertrag/fd4f9fe1-4a9a-41d6-8148-87c35ea48d76",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-128-gb-rosa-ohne-vertrag/0160b922-998d-463f-9585-8278c47951c9",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-128-gb-wei-ohne-vertrag/43d88eec-a61e-469f-8a1d-b0d83ac0ac60",
    // Dual
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-128-gb-schwarz-ohne-vertrag/def07f81-1faf-4c43-aeec-5aa47e2340b8",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-128-gb-grau-ohne-vertrag/e96c97b5-2dec-4218-972a-dfd967979e49",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-128-gb-violett-ohne-vertrag/0400edf2-3e52-44e0-97b6-e2a5df70cbe4",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-128-gb-rosa-ohne-vertrag/8684370c-e189-4bd9-a539-38b2e72b2b70",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-128-gb-wei-ohne-vertrag/e69acc05-cb27-40fa-bfad-0a888539608a",
    // New Battery
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-128-gb-grau-ohne-vertrag/15ad458f-c997-4391-ac91-0fa85a007129",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-128-gb-violett-ohne-vertrag/fd4f9fe1-4a9a-41d6-8148-87c35ea48d76",
    // New Battery, Dual
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-128-gb-violett-ohne-vertrag/0400edf2-3e52-44e0-97b6-e2a5df70cbe4",
    // 256 GB
    "https://www.backmarket.de/de-de/p/samsung-samsung-galaxy-s21-256-gb-schwarz-ohne-vertrag/dd017ee0-5706-4b77-b720-4d90c1dcd1ad",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-256-gb-violett-ohne-vertrag/72717b0c-673a-48b8-a939-35d1b936ce3b",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-256-gb-wei-ohne-vertrag/6a79cd0c-c036-4e1a-a78c-78b2488dea3c",
    // 256 GB, Dual
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-256-gb-grau-ohne-vertrag/98d2bbe4-f6ff-499f-968e-963d4fdea0ae",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-256-gb-violett-ohne-vertrag/07a58360-13a5-4a48-ac5c-0f9cce851538",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-256-gb-ohne-vertrag/75320cb3-89a0-47b3-b418-4c2a05718dd7",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-256-gb-wei-ohne-vertrag/35e5898f-7d25-4ffc-aa47-ce2b43a445ca",
    // New Battery, 256 GB
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-256-gb-grau-ohne-vertrag/a03920b8-fed3-4668-a553-4a2da4b57cf8",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-5g-256-gb-violett-ohne-vertrag/72717b0c-673a-48b8-a939-35d1b936ce3b",
  ],
  "S21 FE": [
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-fe-5g-128-gb-grau-ohne-vertrag/1cc9e2d8-5763-46d5-9901-fcd072ae6eaf",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-fe-5g-128-gb-grun-ohne-vertrag/0c89efae-a70c-499a-9dae-0f38bd37dcd0",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-fe-5g-128-gb-wei-ohne-vertrag/ccaaf8dd-20d3-4f9f-beda-9906d3587b9b",
    // New Battery
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-fe-5g-128-gb-grau-ohne-vertrag/1cc9e2d8-5763-46d5-9901-fcd072ae6eaf",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-fe-5g-128-gb-grun-ohne-vertrag/0c89efae-a70c-499a-9dae-0f38bd37dcd0",
    // New Battery, Dual
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-fe-5g-128-gb-grau-ohne-vertrag/fad76df6-b05d-4396-bedf-e84fde7bc197",
    // Dual
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-fe-5g-128-gb-schwarz-ohne-vertrag/a9881f77-53b5-40fe-aec7-8f679b54e56b",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-fe-5g-128-gb-grun-ohne-vertrag/48b64129-c684-4662-ae84-38746b50c51b",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-fe-5g-128-gb-lavendel-ohne-vertrag/e41d0cc8-e1d3-49df-ba77-953e1d562fc7",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-fe-5g-128-gb-wei-ohne-vertrag/58f90ccc-1ada-41b7-8e45-6090f989d263",
    // 256 GB
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-fe-5g-256-gb-violett-ohne-vertrag/65becb7a-ccea-429c-9f69-456d15dbc030",
    // 256 GB, Dual
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-fe-5g-256-gb-schwarz-ohne-vertrag/b11fe636-6e18-4c87-8f80-13cd75c61f04",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-fe-5g-256-gb-grun-ohne-vertrag/2a3198f8-68fa-4d42-a796-414e6f9a5f34",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-fe-5g-256-gb-violett-ohne-vertrag/a1b67f95-9e1d-4d0b-a955-7b86b1963c35",
  ],
  "S21 Ultra": [
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-ultra-5g-128-gb-silber-ohne-vertrag/9acced0c-c132-4e94-8ef4-56bd2f786de0",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-ultra-5g-128-gb-schwarz-midgnight-black-ohne-vertrag/eb82c373-e060-4ef3-b246-1f6564ebd8b7",
    // Dual
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-ultra-5g-128-gb-schwarz-ohne-vertrag/baaa71ad-a044-4422-9820-bf05d5cb3d9f",
    "https://www.backmarket.de/de-de/p/samsung-sm-g998b-128-gb-ohne-vertrag/414a005b-b279-4bc4-a6d3-d71be36975c9",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-ultra-5g-128-gb-grau-ohne-vertrag/07b21051-8c2e-4dfb-a8db-550e034ba150",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s21-ultra-5g-dual-sim-128-gb-silber-ohne-vertrag/efaa295c-b0d3-4f7a-bb46-d0a4ac74a00d",
  ],
  S22: [
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
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-128-gb-schwarz-ohne-vertrag/ebe9c3fe-bc6a-4655-ba31-091ba6888ea4",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-128-gb-wei-ohne-vertrag/90c2fb25-130f-47a5-8f32-4505d939f747",
    // Dual
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-128-gb-schwarz-ohne-vertrag/ebec5e0e-c64f-4160-9ac7-473781564600",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-128-gb-violett-ohne-vertrag/2cd66d0c-75cc-44d2-98e6-0f544fb80f87",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-128-gb-grun-ohne-vertrag/8c1c220d-e529-4d14-a85c-530265569ff7",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-128-gb-wei-ohne-vertrag/c7654210-fae5-4b8a-b77c-d43a3cf19c32",
    // 256 GB
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-256-gb-schwarz-ohne-vertrag/09cd8103-206c-4750-88cc-4e4754cf43cc",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-256-gb-rot-burgundy-red-ohne-vertrag/f6af9b7b-1787-4411-81de-da8fc4a0361b",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-256-gb-grun-ohne-vertrag/7bf1bcc0-2551-4b70-9f27-7e3ba27d1475",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-256-gb-wei-ohne-vertrag/d8e5a2b2-e959-4588-bc7b-b03e84812093",
    // 256 GB, Dual
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-256-gb-schwarz-ohne-vertrag/09b7cb66-2646-463e-932c-8833de286fd6",
    "https://www.backmarket.de/de-de/p/samsung-sm-s908ds-256-gb-ohne-vertrag/dc6fdc40-3ebb-45b7-9579-264c581238dd",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-256-gb-ohne-vertrag/64317a29-053d-4491-a27d-6a7e11d6aff1",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s22-ultra-5g-256-gb-grun-ohne-vertrag/b3aad73b-302b-4227-bc0a-b95881a65431",
    "https://www.backmarket.de/de-de/p/samsung-f-sm-s908bzwge-256-gb-wei-ohne-vertrag/2b276902-b7a7-4306-9fbd-5d014254e048",
  ],
  S23: [
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s23-128-gb-schwarz-midgnight-black-ohne-vertrag/3bd83a62-d359-44b0-b61d-481ae6f75710?",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s23-128-gb-creme-ohne-vertrag/37d77445-ff1f-4389-bcda-428ba60c7b7f",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s23-128-gb-grun-ohne-vertrag/ba699712-9c9b-46dc-bafa-058388a179ed",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s23-128-gb-lavendel-ohne-vertrag/20cc417d-5133-4e7e-aa75-8812d72664c4",
    // Dual
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s23-128-gb-schwarz-midgnight-black-ohne-vertrag/5cc62834-27e7-40ce-a319-63a13e7d185f",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s23-128-gb-creme-ohne-vertrag/5bbb3747-231c-4cda-838c-4f9fb553dac4",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s23-128-gb-grun-ohne-vertrag/60267589-8498-4120-86c4-1e0bdc8e3424",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s23-128-gb-lavendel-ohne-vertrag/4a71b010-3770-48b2-99e4-1ccde3d8f431",
    // 256 GB, Dual
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s23-256-gb-schwarz-ohne-vertrag/86bc791d-30d3-4fdb-a62d-b8b3bedad57d",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s23-256-gb-schwarz-ohne-vertrag/0db149f9-ad61-46c0-9549-d8885cf041e2",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s23-256-gb-creme-ohne-vertrag/10b7af26-cf09-4629-a8cf-0e135d502bae",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s23-256-gb-grun-ohne-vertrag/66a66010-5440-44e1-8f2a-d506e3a71fac",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s23-256-gb-lavendel-ohne-vertrag/71527a96-b49c-45de-a922-b82c2c9126f3",
    // 256 GB
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s23-256-gb-schwarz-ohne-vertrag/13c21550-424e-4406-9641-e790f5f40e0d",
    "https://www.backmarket.de/de-de/p/samsung-s23-256-gb-ohne-vertrag/e09f7b03-0e6f-4739-94e7-ecd0ad4e6c83",
  ],
  S24: [
    "https://www.backmarket.de/de-de/p/samsung-gb/0e2f3561-74bb-40c9-8bcf-030e29c2a8cc",
    "https://www.backmarket.de/de-de/p/samsung-gb/5741e181-e983-4c00-a801-91eee76a34ac",
    "https://www.backmarket.de/de-de/p/samsung-gb/57995970-a1be-4f99-bdc6-edc3d27f0b5d",
    // Dual
    "https://www.backmarket.de/de-de/p/samsung-gb/02162ae4-dcff-4b8f-ae62-bb7296d82f9d",
    "https://www.backmarket.de/de-de/p/samsung-gb/1ca0d727-ca7b-4692-b4ca-fb18aba7feb4",
    "https://www.backmarket.de/de-de/p/samsung-galaxy-s24-128-gb-blau-ohne-vertrag/26bd3b61-5444-4a12-9635-775923417f2e",
    "https://www.backmarket.de/de-de/p/samsung-gb/9ed45eb4-97ef-48b3-ad8f-cddd66a86ebd",
    "https://www.backmarket.de/de-de/p/samsung-gb/62e1c2b8-8e2c-45f5-a519-1efad9f5ba2e",
  ],
};

// Setup logging once
const setupLogging = () => {
  const logFormatter = (record: log.LogRecord): string =>
    `${record.datetime.toISOString()}: [${record.levelName}] ${record.msg}`;

  log.setup({
    handlers: {
      console: new log.ConsoleHandler("DEBUG", { formatter: logFormatter }),
      file: new log.FileHandler("DEBUG", {
        filename: "./debug.log",
        formatter: logFormatter,
      }),
    },
    loggers: {
      default: {
        level: "DEBUG",
        handlers: ["console", "file"],
      },
    },
  });
};

// Utility functions
const timeout = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getEuros = (input: string): string | undefined => {
  const value = Number(input.match(/[\d,]/g)?.join("").replace(",", "."));
  return isNaN(value) ? undefined : String(Math.round(value));
};

const ensureDebugDir = async (): Promise<void> => {
  try {
    await Deno.readDir(CONFIG.debugDir);
  } catch {
    await Deno.mkdir(CONFIG.debugDir);
  }
};

// File operations with error handling
async function readCsvFile<T>(
  fileName: string,
  columns: ParseOptions["columns"]
): Promise<T[]> {
  try {
    const content = await Deno.readTextFile(fileName);
    return parse(content, { columns, separator: ";" }) as T[];
  } catch (error) {
    log.warn(`Error reading ${fileName}: ${error}`);
    await timeout(2000);
    await Deno.writeTextFile(
      fileName,
      stringify([], { columns, separator: ";" })
    );
    return readCsvFile(fileName, columns);
  }
}

async function writeCsvFile<T>(
  fileName: string,
  data: readonly DataItem[],
  columns?: StringifyOptions["columns"],
  headers = false
): Promise<void> {
  await Deno.writeTextFile(
    resolve(import.meta.dirname ? import.meta.dirname : "", "../../", fileName),
    stringify(data, { columns, headers, separator: ";" })
  );
}

// Core functionality
async function fetchPageData(url: string): Promise<string> {
  const response = await fetch(url, {
    method: "OPTIONS",
    cache: "no-cache",
  });
  return await response.text();
}

function processQualityData(
  qualityEls: HTMLCollection
): Record<string, string | undefined> {
  const amounts: string[] = [];

  for (const quality of qualityEls) {
    const amount = getEuros(quality.innerText);
    if (amount) amounts.push(amount);
  }

  return {
    gut: amounts[0],
    sehr_gut: amounts[1],
    hervorragend: amounts[2],
    premium: amounts[3],
  };
}

function calculateStats(history: IItem[]): IStats[] {
  const groupedData = history.reduce<Record<string, IItem[]>>((acc, item) => {
    (acc[item.id] = acc[item.id] || []).push(item);
    return acc;
  }, {});

  return Object.entries(groupedData).map(([id, entries]) => {
    const getLowestValue = (
      quality: keyof Pick<
        IItem,
        "gut" | "sehr_gut" | "hervorragend" | "premium"
      >
    ) => {
      const validEntries = entries.filter(
        (entry) => Number(entry[quality]) > 0
      );
      if (!validEntries.length)
        return { value: 0, timestamp: "", name: "", url: "" };

      const minEntry = validEntries.reduce((min, entry) =>
        Number(entry[quality]) < Number(min[quality]) ? entry : min
      );

      return {
        value: Number(minEntry[quality]),
        timestamp: minEntry.timestamp,
        name: minEntry.name,
        url: minEntry.url,
      };
    };

    const qualities = ["gut", "sehr_gut", "hervorragend", "premium"] as const;
    const stats = qualities.reduce((acc, quality) => {
      const { value, timestamp, name, url } = getLowestValue(quality);
      return {
        ...acc,
        [quality]: value,
        [`${quality}_timestamp`]: timestamp,
        [`${quality}_name`]: name,
        [`${quality}_url`]: url,
      };
    }, {} as Partial<IStats>);

    return { id, url: entries[0].url, ...stats } as IStats;
  });
}

async function handlePageProcessing(
  id: string,
  url: string,
  dataOverwrite?: string
): Promise<IItem | undefined> {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();

  try {
    const data = dataOverwrite || (await fetchPageData(url));
    if (!data) throw new Error("No data received");

    if (data.includes("bot-need-challenge")) {
      log.warn("Bot detected, cooling off...");
      await timeout(CONFIG.botCooldownTime);
      return handlePageProcessing(id, url, dataOverwrite);
    }

    const doc = new DOMParser().parseFromString(data, "text/html");
    const qualityEls = doc.querySelector(CONFIG.queryQuality)?.children;
    const title = doc.querySelector(
      '[data-test="container-wrapper"] .heading-1'
    )?.innerText;

    if (!title) {
      throw new Error("No title found");
    }

    if (title.includes("Oh Oh ... da ist wohl etwas schief gelaufen")) {
      await timeout(CONFIG.errorCooldownTime);
      return handlePageProcessing(id, url, dataOverwrite);
    }

    if (!qualityEls) {
      throw new Error("No quality elements found");
    }

    const qualityData = processQualityData(qualityEls);
    const item: IItem = {
      id,
      url,
      timestamp,
      name: title,
      ...qualityData,
    };

    log.debug(`Processed ${url} in ${performance.now() - startTime}ms`);
    return item;
  } catch (error) {
    log.error(`Error processing ${url}: ${error.message}`);
    return undefined;
  }
}

export async function main(repeat = false): Promise<void> {
  const startTime = performance.now();
  setupLogging();
  await ensureDebugDir();

  try {
    const history = await readCsvFile<IItem>(
      CONFIG.historyFileName,
      itemColumns
    );

    for (const [product, urls] of Object.entries(UrlList)) {
      for (const [i, url] of urls.entries()) {
        if (i !== 0 && repeat) {
          await timeout(CONFIG.cooldownTime);
        }

        const data = await handlePageProcessing(product, url);
        if (data) {
          history.push(data);
          await writeCsvFile(CONFIG.historyFileName, history, itemColumns);
          await writeCsvFile(
            CONFIG.statsFileName,
            calculateStats(history.slice(1)),
            statsColumns,
            true
          );
        }
      }
    }

    const duration = Math.round((performance.now() - startTime) / 1000);
    log.debug(
      `Completed in ${duration}s. ${repeat ? "Restarting..." : "Waiting..."}`
    );

    if (repeat) {
      main(true);
    }
  } catch (error) {
    log.error(`Main process error: ${error.message}`);
    if (repeat) {
      await timeout(CONFIG.errorCooldownTime);
      main(true);
    }
  }
}
