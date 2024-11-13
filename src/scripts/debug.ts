import { resolve } from "jsr:@std/path";

const timestamp = "12344578";
const url = "https://example.org";

const filename = `${timestamp}-${url}`.replace(/\W/g, "-");

await Deno.writeTextFile(
  resolve(
    import.meta.dirname ? import.meta.dirname : "",
    "../..",
    `/debug/no-title-found-${filename}.html`
  ),
  "hello"
);
