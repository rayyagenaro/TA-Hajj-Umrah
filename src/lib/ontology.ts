import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";

type ContextType = "Umrah";

type NumericProperty =
  | "budget"
  | "usia"
  | "durasi_preferensi"
  | "prefer_jarak_hotel_maks"
  | "jumlah_jamaah";
type BooleanProperty = "butuh_pendampingan" | "butuh_private" | "prefer_direct_flight" | "prefer_transit_flight";
type StringProperty =
  | "preferensi_hotel"
  | "tipe_transportasi"
  | "destinasi_tambahan"
  | "prefer_destinasi"
  | "musim_preferensi";
type CompareOperator = "gt" | "gte" | "lt" | "lte" | "eq" | "neq";
type StringOperator = "eq" | "neq";

type Condition =
  | { kind: "compare"; property: NumericProperty; operator: CompareOperator; value: number }
  | { kind: "boolean"; property: BooleanProperty; value: boolean }
  | { kind: "string"; property: StringProperty; operator: StringOperator; value: string; caseInsensitive: boolean };

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
  durasiPreferensi?: number;
  preferJarakHotelMaks?: number;
  jumlahJamaah?: number;
  butuhPendampingan?: boolean;
  butuhPrivate?: boolean;
  preferDirectFlight?: boolean;
  musimPreferensi?: string;
  preferDestinasi?: string;
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
const ONTOLOGY_FILE = "22april.owl";

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
  if (rules.length === 0) {
    throw new Error(`Ontology ${ONTOLOGY_FILE} tidak memiliki DLSafeRule yang terbaca.`);
  }
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

  const memilihAtom = objectAtoms.find(
    (atom) => getLocalName(getAttribute(atom, "ObjectProperty", "IRI")) === "memilih_ibadah",
  );
  const context = memilihAtom
    ? normalizeContext(getLocalName(getAttribute(memilihAtom, "NamedIndividual", "IRI")))
    : "Umrah";
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
      if (isBooleanProperty(property) && typeof literal === "boolean") {
        conditions.push({ kind: "boolean", property, value: literal });
      } else if (isStringProperty(property) && typeof literal === "string") {
        conditions.push({ kind: "string", property, operator: "eq", value: literal, caseInsensitive: true });
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
    } else if (isBooleanProperty(property) && typeof literal === "boolean" && operator === "equal") {
      conditions.push({ kind: "boolean", property, value: literal });
    } else if (isStringProperty(property) && typeof literal === "string") {
      if (operator === "stringEqualIgnoreCase" || operator === "equal") {
        conditions.push({ kind: "string", property, operator: "eq", value: literal, caseInsensitive: true });
      } else if (operator === "notEqual") {
        conditions.push({ kind: "string", property, operator: "neq", value: literal, caseInsensitive: true });
      }
    }
  }

  const headAtoms = toArray(head["ObjectPropertyAtom"]).filter(isRecord);
  const recommendationAtom = headAtoms.find((atom) => {
    const objectProperty = getLocalName(getAttribute(atom, "ObjectProperty", "IRI"));
    return (
      objectProperty === "mendapat_rekomendasi" ||
      objectProperty === "mendapat_rekomendasi_single" ||
      objectProperty === "mendapat_rekomendasi_multi"
    );
  });
  if (!recommendationAtom) return null;

  const rawRecommendation = getLocalName(getAttribute(recommendationAtom, "NamedIndividual", "IRI"));
  const recommendation = normalizeRecommendationName(rawRecommendation);
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
    preferenceScore: number;
    specificity: number;
    ruleId: string;
  }> = [];

  for (const rule of relevant) {
    if (ruleMatches(rule, input)) {
      matches.push({
        detail: { paket: rule.recommendation, label: rule.label, comment: rule.comment },
        score: scoreRule(rule),
        preferenceScore: scoreMatchedRulePreference(rule, input),
        specificity: rule.conditions.length,
        ruleId: rule.id,
      });
    }
  }

  matches.sort(compareScoredMatches);

  const blockingMatch = matches.find((match) => isBlockingRecommendation(match.detail.paket));
  if (blockingMatch) {
    return {
      paketUtama: blockingMatch.detail,
      paketAlternatif: [],
    };
  }

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

function isBlockingRecommendation(paket: string): boolean {
  const normalized = normalizeRecommendationName(paket);
  return (
    normalized.startsWith("TidakMendapatRekomendasi") ||
    normalized === "TidakMendapatPaket" ||
    normalized === "UmrahTidakDirekomendasikan"
  );
}

function scoreRule(rule: Rule): number {
  return rule.conditions.reduce((total, condition) => total + getConditionWeight(condition), 0);
}

function getConditionWeight(condition: Condition): number {
  if (condition.kind === "compare") return 2;
  if (condition.kind === "boolean") return 3;
  if (condition.kind === "string") {
    return condition.property === "destinasi_tambahan" || condition.property === "prefer_destinasi" ? 5 : 4;
  }
  return 0;
}

function compareScoredMatches(
  a: { score: number; preferenceScore: number; specificity: number; ruleId: string },
  b: { score: number; preferenceScore: number; specificity: number; ruleId: string },
): number {
  if (a.score !== b.score) return b.score - a.score;
  if (a.preferenceScore !== b.preferenceScore) return b.preferenceScore - a.preferenceScore;
  if (a.specificity !== b.specificity) return b.specificity - a.specificity;
  return a.ruleId.localeCompare(b.ruleId);
}

function scoreMatchedRulePreference(rule: Rule, input: PreferenceInput): number {
  return rule.conditions.reduce((total, condition) => total + scoreConditionPreference(condition, input), 0);
}

function scoreConditionPreference(condition: Condition, input: PreferenceInput): number {
  if (condition.kind === "boolean") {
    return 6;
  }

  if (condition.kind === "string") {
    return condition.property === "destinasi_tambahan" || condition.property === "prefer_destinasi" ? 8 : 6;
  }

  const value = getNumericValue(condition.property, input);
  if (value === undefined) return 0;

  switch (condition.property) {
    case "durasi_preferensi":
      return scoreDurationPreference(condition.operator, value, condition.value);
    case "budget":
      return scoreBudgetPreference(condition.operator, value, condition.value);
    case "prefer_jarak_hotel_maks":
      return scoreJarakPreference(condition.operator, value, condition.value);
    case "usia":
      return Math.max(1, 6 - Math.round(Math.abs(value - condition.value) / 10));
    default:
      return 2;
  }
}

function scoreDurationPreference(operator: CompareOperator, actual: number, threshold: number): number {
  const gap = Math.abs(actual - threshold);
  if (operator === "eq") return Math.max(1, 10 - gap * 2);
  if (operator === "gte" || operator === "gt") return Math.max(1, 9 - gap * 2);
  if (operator === "lte" || operator === "lt") return Math.max(1, 9 - gap * 2);
  return 2;
}

function scoreBudgetPreference(operator: CompareOperator, actual: number, threshold: number): number {
  const relativeGap = Math.abs(actual - threshold) / Math.max(threshold, 1);
  if (operator === "eq") return Math.max(1, 8 - Math.round(relativeGap * 20));
  if (operator === "gte" || operator === "gt") return Math.max(1, 7 - Math.round(relativeGap * 16));
  if (operator === "lte" || operator === "lt") return Math.max(1, 7 - Math.round(relativeGap * 16));
  return 2;
}

function scoreJarakPreference(operator: CompareOperator, actual: number, threshold: number): number {
  const gap = Math.abs(actual - threshold);
  if (operator === "eq") return Math.max(1, 8 - Math.round(gap / 75));
  if (operator === "gte" || operator === "gt") return Math.max(1, 6 - Math.round(gap / 100));
  if (operator === "lte" || operator === "lt") return Math.max(1, 8 - Math.round(gap / 100));
  return 2;
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
        case "eq":
          return value === condition.value;
        case "neq":
          return value !== condition.value;
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
      const isEqual = condition.caseInsensitive
        ? value.localeCompare(condition.value, undefined, { sensitivity: "accent" }) === 0
        : value === condition.value;
      return condition.operator === "neq" ? !isEqual : isEqual;
    }
    default:
      return false;
  }
}

function getNumericValue(property: NumericProperty, input: PreferenceInput): number | undefined {
  switch (property) {
    case "budget":
      return input.budget;
    case "usia":
      return input.usia;
    case "durasi_preferensi":
      return input.durasiPreferensi;
    case "prefer_jarak_hotel_maks":
      return input.preferJarakHotelMaks;
    case "jumlah_jamaah":
      return input.jumlahJamaah;
    default:
      return undefined;
  }
}

function getBooleanValue(property: BooleanProperty, input: PreferenceInput): boolean | undefined {
  switch (property) {
    case "butuh_pendampingan":
      return input.butuhPendampingan;
    case "butuh_private":
      return input.butuhPrivate;
    case "prefer_direct_flight":
      return input.preferDirectFlight;
    case "prefer_transit_flight":
      if (typeof input.preferDirectFlight === "boolean") {
        return !input.preferDirectFlight;
      }
      return input.tipeTransportasi ? input.tipeTransportasi === "Ekonomi" : undefined;
    default:
      return undefined;
  }
}

function getStringValue(property: StringProperty, input: PreferenceInput): string | undefined {
  switch (property) {
    case "preferensi_hotel":
      return input.preferensiHotel ?? undefined;
    case "tipe_transportasi":
      return input.tipeTransportasi ?? undefined;
    case "destinasi_tambahan":
      return input.preferDestinasi ?? input.destinasiTambahan ?? "None";
    case "prefer_destinasi":
      return input.preferDestinasi ?? input.destinasiTambahan ?? "None";
    case "musim_preferensi":
      return input.musimPreferensi ?? undefined;
    default:
      return undefined;
  }
}

function mapOperator(operator: string): CompareOperator | null {
  switch (operator) {
    case "greaterThan":
      return "gt";
    case "greaterThanOrEqual":
      return "gte";
    case "lessThan":
      return "lt";
    case "lessThanOrEqual":
      return "lte";
    case "equal":
      return "eq";
    case "notEqual":
      return "neq";
    default:
      return null;
  }
}

function mapDataProperty(localName: string): StringProperty | NumericProperty | BooleanProperty | null {
  switch (localName) {
    case "budget":
    case "preferensi_budget":
      return "budget";
    case "usia":
    case "usia_jamaah":
      return "usia";
    case "durasi_preferensi":
    case "preferensi_durasi":
      return "durasi_preferensi";
    case "prefer_jarak_hotel_maks":
    case "preferensi_jarak_hotel":
      return "prefer_jarak_hotel_maks";
    case "jumlah_jamaah":
      return "jumlah_jamaah";
    case "butuh_pendampingan":
      return "butuh_pendampingan";
    case "butuh_private":
      return "butuh_private";
    case "prefer_direct_flight":
    case "preferensi_tipe_pesawat_direct":
      return "prefer_direct_flight";
    case "preferensi_tipe_pesawat_transit":
      return "prefer_transit_flight";
    case "preferensi_hotel":
      return "preferensi_hotel";
    case "tipe_transportasi":
      return "tipe_transportasi";
    case "destinasi_tambahan":
    case "preferensi_destinasi_tambahan":
      return "destinasi_tambahan";
    case "prefer_destinasi":
      return "prefer_destinasi";
    case "musim_preferensi":
      return "musim_preferensi";
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
  return (
    property === "budget" ||
    property === "usia" ||
    property === "durasi_preferensi" ||
    property === "prefer_jarak_hotel_maks" ||
    property === "jumlah_jamaah"
  );
}

function isBooleanProperty(property: unknown): property is BooleanProperty {
  return (
    property === "butuh_pendampingan" ||
    property === "butuh_private" ||
    property === "prefer_direct_flight" ||
    property === "prefer_transit_flight"
  );
}

function isStringProperty(property: unknown): property is StringProperty {
  return (
    property === "preferensi_hotel" ||
    property === "tipe_transportasi" ||
    property === "destinasi_tambahan" ||
    property === "prefer_destinasi" ||
    property === "musim_preferensi"
  );
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

function normalizeRecommendationName(name: string): string {
  if (!name) return "";
  const withoutSuffix = name.endsWith("_Ind") ? name.slice(0, -4) : name;
  if (withoutSuffix === "TidakMendapatPaket") return "TidakMendapatRekomendasiUmrah";
  return withoutSuffix;
}
