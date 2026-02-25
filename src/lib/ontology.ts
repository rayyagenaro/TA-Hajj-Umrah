import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";

type ContextType = "Umrah";

type NumericProperty = "budget" | "usia";
type BooleanProperty = "butuh_pendampingan";
type StringProperty = "preferensi_hotel" | "tipe_transportasi" | "destinasi_tambahan";

type Condition =
  | { kind: "compare"; property: NumericProperty; operator: "gt" | "gte" | "lt" | "lte"; value: number }
  | { kind: "boolean"; property: BooleanProperty; value: boolean }
  | { kind: "string"; property: StringProperty; value: string; caseInsensitive: boolean };

export interface Rule {
  id: string;
  context: ContextType;
  recommendation: string;
  label?: string;
  comment?: string;
  conditions: Condition[];
}

export interface PreferenceInput {
  ibadah: ContextType;
  budget?: number;
  usia?: number;
  butuhPendampingan?: boolean;
  preferensiHotel?: string;
  tipeTransportasi?: string;
  destinasiTambahan?: string | null;
  nama?: string;
}

export interface RecommendationDetail {
  paket: string;
  label?: string;
  comment?: string;
}

export interface InferenceResult {
  paketUtama: RecommendationDetail | null;
  paketAlternatif: RecommendationDetail[];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  textNodeName: "value",
  parseTagValue: false,
});

const DATA_DIR = path.join(process.cwd(), "public", "data");
const ONTOLOGY_FILE = "final.owl";

let cachedRules: Rule[] | null = null;
let cachedTimestamp: number | null = null;

type UnknownObject = Record<string, unknown>;

export async function loadOntologyRules(): Promise<Rule[]> {
  const filePath = path.join(DATA_DIR, ONTOLOGY_FILE);
  const fileStat = await stat(filePath);
  if (cachedRules && cachedTimestamp === fileStat.mtimeMs) {
    return cachedRules;
  }

  const xml = await readFile(filePath, "utf8");
  const parsed = parser.parse(xml) as UnknownObject;
  const rules = extractRules(parsed);
  cachedRules = rules;
  cachedTimestamp = fileStat.mtimeMs;
  return rules;
}

function extractRules(parsed: UnknownObject): Rule[] {
  const ontology = (parsed["Ontology"] ?? {}) as UnknownObject;
  const rawRules = toArray(ontology["DLSafeRule"]);

  const rules: Rule[] = [];
  for (const raw of rawRules) {
    if (!isRecord(raw)) continue;
    const rule = convertRule(raw);
    if (rule) rules.push(rule);
  }
  return rules;
}

function convertRule(rawRule: UnknownObject): Rule | null {
  const body = (rawRule["Body"] ?? {}) as UnknownObject;
  const head = (rawRule["Head"] ?? {}) as UnknownObject;

  const objectAtoms = toArray(body["ObjectPropertyAtom"]).filter(isRecord);
  const dataAtoms = toArray(body["DataPropertyAtom"]).filter(isRecord);
  const builtInAtoms = toArray(body["BuiltInAtom"]).filter(isRecord);

  const subjectVariable = getSubjectVariable(body);

  const memilihAtom = objectAtoms.find((atom) => getLocalName(getAttribute(atom, "ObjectProperty", "IRI")) === "memilih_ibadah");
  if (!memilihAtom) return null;

  const contextIndividual = getAttribute(memilihAtom, "NamedIndividual", "IRI");
  const context = normalizeContext(getLocalName(contextIndividual));
  if (!context) return null;

  const annotations = toArray(rawRule["Annotation"]).filter(isRecord);
  const label = findAnnotation(annotations, "rdfs:label");
  const comment = findAnnotation(annotations, "rdfs:comment");

  const variableMap = new Map<string, StringProperty | NumericProperty | BooleanProperty>();
  const conditions: Condition[] = [];

  for (const atom of dataAtoms) {
    const propertyIri = getAttribute(atom, "DataProperty", "IRI");
    const property = mapDataProperty(getLocalName(propertyIri));
    if (!property) continue;

    const literalNode = atom["Literal"];
    if (literalNode !== undefined) {
      const literal = parseLiteral(literalNode);
      if (literal === undefined) continue;
      if (property === "butuh_pendampingan" && typeof literal === "boolean") {
        conditions.push({ kind: "boolean", property, value: literal });
      } else if (isStringProperty(property) && typeof literal === "string") {
        conditions.push({ kind: "string", property, value: literal, caseInsensitive: true });
      }
    }

    const variableNames = extractVariableNames(atom["Variable"]);
    for (const variableName of variableNames) {
      if (subjectVariable && variableName === subjectVariable) continue;
      variableMap.set(variableName, property);
    }
  }

  for (const atom of builtInAtoms) {
    const iri = typeof atom["IRI"] === "string" ? atom["IRI"] : "";
    const operator = getLocalName(iri);
    const variableNames = extractVariableNames(atom["Variable"]);
    const literalNode = atom["Literal"];
    if (variableNames.length === 0 || !literalNode) continue;

    const variableName = variableNames[0];
    const property = variableMap.get(variableName);
    if (!property) continue;

    const literal = parseLiteral(literalNode);
    if (literal === undefined) continue;

    if (isNumericProperty(property) && typeof literal === "number") {
      const compare = mapOperator(operator);
      if (compare) {
        conditions.push({ kind: "compare", property, operator: compare, value: literal });
      }
    } else if (isStringProperty(property) && typeof literal === "string" && operator === "stringEqualIgnoreCase") {
      conditions.push({ kind: "string", property, value: literal, caseInsensitive: true });
    }
  }

  const headAtoms = toArray(head["ObjectPropertyAtom"]).filter(isRecord);
  const recommendationAtom = headAtoms.find((atom) => getLocalName(getAttribute(atom, "ObjectProperty", "IRI")) === "mendapat_rekomendasi");
  if (!recommendationAtom) return null;

  const recommendation = getLocalName(getAttribute(recommendationAtom, "NamedIndividual", "IRI"));
  if (!recommendation) return null;

  const id = typeof rawRule["rdf:ID"] === "string" ? rawRule["rdf:ID"] : recommendation;

  return {
    id,
    context,
    recommendation,
    label,
    comment,
    conditions,
  };
}

export function inferRecommendations(input: PreferenceInput, rules: Rule[]): InferenceResult {
  const relevant = rules.filter((rule) => rule.context === input.ibadah);
  const matches: Array<{
    detail: RecommendationDetail;
    score: number;
    specificity: number;
    ruleId: string;
  }> = [];

  for (const rule of relevant) {
    if (ruleMatches(rule, input)) {
      matches.push({
        detail: { paket: rule.recommendation, label: rule.label, comment: rule.comment },
        score: scoreRule(rule),
        specificity: rule.conditions.length,
        ruleId: rule.id,
      });
    }
  }

  matches.sort(compareScoredMatches);

  const unique = new Map<string, (typeof matches)[number]>();
  for (const match of matches) {
    const key = match.detail.paket;
    if (!unique.has(key)) {
      unique.set(key, {
        ...match,
        detail: { ...match.detail },
      });
    } else {
      const existing = unique.get(key)!;
      if (!existing.detail.label && match.detail.label) existing.detail.label = match.detail.label;
      if (!existing.detail.comment && match.detail.comment) existing.detail.comment = match.detail.comment;
    }
  }

  const list = Array.from(unique.values()).map((entry) => entry.detail);
  const [first, ...rest] = list;
  return {
    paketUtama: first ?? null,
    paketAlternatif: rest,
  };
}

function scoreRule(rule: Rule): number {
  return rule.conditions.reduce((total, condition) => total + getConditionWeight(condition), 0);
}

function getConditionWeight(condition: Condition): number {
  if (condition.kind === "compare") return 2;
  if (condition.kind === "boolean") return 3;
  if (condition.kind === "string") {
    return condition.property === "destinasi_tambahan" ? 5 : 4;
  }
  return 0;
}

function compareScoredMatches(
  a: { score: number; specificity: number; ruleId: string },
  b: { score: number; specificity: number; ruleId: string },
): number {
  if (a.score !== b.score) return b.score - a.score;
  if (a.specificity !== b.specificity) return b.specificity - a.specificity;
  return a.ruleId.localeCompare(b.ruleId);
}

function ruleMatches(rule: Rule, input: PreferenceInput): boolean {
  return rule.conditions.every((condition) => evaluateCondition(condition, input));
}

function evaluateCondition(condition: Condition, input: PreferenceInput): boolean {
  switch (condition.kind) {
    case "compare": {
      const value = getNumericValue(condition.property, input);
      if (value === undefined) return false;
      switch (condition.operator) {
        case "gt":
          return value > condition.value;
        case "gte":
          return value >= condition.value;
        case "lt":
          return value < condition.value;
        case "lte":
          return value <= condition.value;
        default:
          return false;
      }
    }
    case "boolean": {
      const value = getBooleanValue(condition.property, input);
      if (value === undefined) return false;
      return value === condition.value;
    }
    case "string": {
      const value = getStringValue(condition.property, input);
      if (!value) return false;
      return condition.caseInsensitive
        ? value.localeCompare(condition.value, undefined, { sensitivity: "accent" }) === 0
        : value === condition.value;
    }
    default:
      return false;
  }
}

function getNumericValue(property: NumericProperty, input: PreferenceInput): number | undefined {
  if (property === "budget") return input.budget;
  if (property === "usia") return input.usia;
  return undefined;
}

function getBooleanValue(property: BooleanProperty, input: PreferenceInput): boolean | undefined {
  if (property === "butuh_pendampingan") return input.butuhPendampingan;
  return undefined;
}

function getStringValue(property: StringProperty, input: PreferenceInput): string | undefined {
  switch (property) {
    case "preferensi_hotel":
      return input.preferensiHotel ?? undefined;
    case "tipe_transportasi":
      return input.tipeTransportasi ?? undefined;
    case "destinasi_tambahan":
      return input.destinasiTambahan ?? undefined;
    default:
      return undefined;
  }
}

function mapOperator(operator: string): Condition["operator"] | null {
  switch (operator) {
    case "greaterThan":
      return "gt";
    case "greaterThanOrEqual":
      return "gte";
    case "lessThan":
      return "lt";
    case "lessThanOrEqual":
      return "lte";
    default:
      return null;
  }
}

function mapDataProperty(localName: string): StringProperty | NumericProperty | BooleanProperty | null {
  switch (localName) {
    case "budget":
    case "usia":
      return localName;
    case "butuh_pendampingan":
      return "butuh_pendampingan";
    case "preferensi_hotel":
      return "preferensi_hotel";
    case "tipe_transportasi":
      return "tipe_transportasi";
    case "destinasi_tambahan":
      return "destinasi_tambahan";
    default:
      return null;
  }
}

function normalizeContext(name: string | undefined): ContextType | null {
  if (!name) return null;
  if (name === "Umrah") return "Umrah";
  return null;
}

function getLocalName(iri: unknown): string {
  if (typeof iri !== "string") return "";
  const hashIndex = iri.lastIndexOf("#");
  if (hashIndex >= 0) return iri.slice(hashIndex + 1);
  const slashIndex = iri.lastIndexOf("/");
  return slashIndex >= 0 ? iri.slice(slashIndex + 1) : iri;
}

function getAttribute(source: unknown, key: string | undefined, attribute: string): string {
  if (Array.isArray(source)) {
    for (const item of source) {
      const result = getAttribute(item, key, attribute);
      if (result) return result;
    }
    return "";
  }
  if (!isRecord(source)) return "";
  if (key) {
    const value = source[key];
    if (isRecord(value)) {
      const attr = value[attribute];
      return typeof attr === "string" ? attr : "";
    }
    return "";
  }
  const attr = source[attribute];
  return typeof attr === "string" ? attr : "";
}

function parseLiteral(node: unknown): string | number | boolean | undefined {
  if (node === undefined || node === null) return undefined;
  if (typeof node === "string") return node;
  if (Array.isArray(node)) {
    for (const entry of node) {
      const parsed = parseLiteral(entry);
      if (parsed !== undefined) return parsed;
    }
    return undefined;
  }
  if (!isRecord(node)) return undefined;

  const value = node["value"];
  if (typeof value !== "string") return undefined;

  const datatype = typeof node["datatypeIRI"] === "string" ? node["datatypeIRI"] : undefined;
  if (!datatype) {
    return value;
  }
  if (datatype.endsWith("#integer")) {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  if (datatype.endsWith("#decimal") || datatype.endsWith("#double")) {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  if (datatype.endsWith("#boolean")) {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
    return undefined;
  }
  return value;
}

function findAnnotation(annotations: UnknownObject[], target: string): string | undefined {
  for (const annotation of annotations) {
    const property = getAttribute(annotation, "AnnotationProperty", "abbreviatedIRI");
    if (property === target) {
      const literal = annotation["Literal"];
      const value = parseLiteral(literal);
      if (typeof value === "string") return value;
    }
  }
  return undefined;
}

function toArray<T>(value: unknown): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value as T];
}

function isRecord(value: unknown): value is UnknownObject {
  return typeof value === "object" && value !== null;
}

function isNumericProperty(property: unknown): property is NumericProperty {
  return property === "budget" || property === "usia";
}

function isStringProperty(property: unknown): property is StringProperty {
  return property === "preferensi_hotel" || property === "tipe_transportasi" || property === "destinasi_tambahan";
}

function extractVariableNames(node: unknown): string[] {
  if (node === undefined || node === null) return [];
  if (typeof node === "string") return [node];
  if (Array.isArray(node)) {
    const names = new Set<string>();
    for (const entry of node) {
      for (const name of extractVariableNames(entry)) {
        names.add(name);
      }
    }
    return Array.from(names);
  }
  if (isRecord(node)) {
    const abbreviated = node["abbreviatedIRI"];
    if (typeof abbreviated === "string") return [abbreviated];
    const iri = node["IRI"];
    if (typeof iri === "string") return [iri];
    const value = node["value"];
    if (typeof value === "string") return [value];
  }
  return [];
}

function getSubjectVariable(body: UnknownObject): string | null {
  const classAtoms = toArray(body["ClassAtom"]).filter(isRecord);
  for (const atom of classAtoms) {
    const variables = extractVariableNames(atom["Variable"]);
    if (variables.length > 0) return variables[0];
  }
  return null;
}
