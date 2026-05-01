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
  const rawRules = parsed.Ontology?.DLSafeRule;
  const rules = Array.isArray(rawRules) ? rawRules : rawRules ? [rawRules] : [];
  for (const [index, rule] of rules.entries()) {
    const built = rule?.Body?.BuiltInAtom;
    if (!built) continue;
    const list = Array.isArray(built) ? built : [built];
    for (const item of list) {
      console.log(`Rule ${index + 1}`);
      console.dir(item, { depth: null });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
