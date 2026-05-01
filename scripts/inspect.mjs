import path from "node:path";
import { readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  textNodeName: "value",
  parseTagValue: false,
});

async function main() {
  const filePath = path.join(process.cwd(), "public", "data", "22april.owl");
  const xml = await readFile(filePath, "utf8");
  const parsed = parser.parse(xml);

  const rules = parsed.Ontology?.DLSafeRule;
  console.log("Rule count:", Array.isArray(rules) ? rules.length : rules ? 1 : 0);
  const first = Array.isArray(rules) ? rules[0] : rules;
  console.dir(first, { depth: null });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
