import test from "node:test";
import assert from "node:assert/strict";
import { inferRecommendations, loadOntologyRules, type PreferenceInput, type Rule } from "../src/lib/ontology";

const baseInput: PreferenceInput = {
  ibadah: "Umrah",
  budget: 35_000_000,
  usia: 42,
  butuhPendampingan: false,
  preferensiHotel: "Premium",
  tipeTransportasi: "Bisnis",
  destinasiTambahan: "Turki",
};

test("returns blocking recommendation as main result and clears alternatives", () => {
  const rules: Rule[] = [
    {
      id: "R1",
      context: "Umrah",
      recommendation: "UmrahPlusTurki",
      conditions: [{ kind: "string", property: "destinasi_tambahan", operator: "eq", value: "Turki", caseInsensitive: true }],
    },
    {
      id: "R2",
      context: "Umrah",
      recommendation: "TidakMendapatRekomendasiUmrah",
      conditions: [{ kind: "compare", property: "budget", operator: "lt", value: 15_000_000 }],
    },
  ];

  const result = inferRecommendations({ ...baseInput, budget: 10_000_000 }, rules);
  assert.equal(result.paketUtama?.paket, "TidakMendapatRekomendasiUmrah");
  assert.deepEqual(result.paketAlternatif, []);
});

test("prioritizes higher score and deduplicates package recommendations", () => {
  const rules: Rule[] = [
    {
      id: "R-LOW",
      context: "Umrah",
      recommendation: "UmrahReguler",
      conditions: [{ kind: "boolean", property: "butuh_pendampingan", value: false }],
    },
    {
      id: "R-HIGH",
      context: "Umrah",
      recommendation: "UmrahPlusTurki",
      conditions: [
        { kind: "string", property: "destinasi_tambahan", operator: "eq", value: "Turki", caseInsensitive: true },
        { kind: "string", property: "tipe_transportasi", operator: "eq", value: "Bisnis", caseInsensitive: true },
      ],
    },
    {
      id: "R-HIGH-2",
      context: "Umrah",
      recommendation: "UmrahPlusTurki",
      label: "Paket Turki Prioritas",
      conditions: [{ kind: "string", property: "destinasi_tambahan", operator: "eq", value: "Turki", caseInsensitive: true }],
    },
  ];

  const result = inferRecommendations(baseInput, rules);
  assert.equal(result.paketUtama?.paket, "UmrahPlusTurki");
  assert.equal(result.paketUtama?.label, "Paket Turki Prioritas");
  assert.equal(result.paketAlternatif.length, 1);
  assert.equal(result.paketAlternatif[0]?.paket, "UmrahReguler");
});

test("loads ontology rules from OWL data source", async () => {
  const rules = await loadOntologyRules();
  assert.ok(rules.length > 0);
  assert.ok(rules.some((rule) => rule.context === "Umrah"));
});

test("prefers the matched rule whose duration threshold is closer to the input when base score is equal", () => {
  const rules: Rule[] = [
    {
      id: "R-DUR-12",
      context: "Umrah",
      recommendation: "UmrahVIPGold",
      label: "Durasi 12",
      conditions: [{ kind: "compare", property: "durasi_preferensi", operator: "gte", value: 12 }],
    },
    {
      id: "R-DUR-10",
      context: "Umrah",
      recommendation: "UmrahReguler",
      label: "Durasi 10",
      conditions: [{ kind: "compare", property: "durasi_preferensi", operator: "gte", value: 10 }],
    },
  ];

  const result = inferRecommendations({ ...baseInput, destinasiTambahan: null, durasiPreferensi: 12 }, rules);

  assert.equal(result.paketUtama?.paket, "UmrahVIPGold");
  assert.equal(result.paketUtama?.label, "Durasi 12");
});
