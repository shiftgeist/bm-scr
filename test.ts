const timestamp = "12344578";
const url = "https://example.org";

const filename = `${timestamp}-${url}`.replace(/\W/g, "-");

await Deno.writeTextFile(
  import.meta.dirname + `/debug/no-title-found/${filename}.html`,
  "hello"
);
