import { inferRecommendations, loadOntologyRules, type PreferenceInput } from "@/lib/ontology";

type Sample = {
  key: string;
  name: string;
  input: PreferenceInput;
};

const SAMPLES: Sample[] = [
  {
    key: "reguler",
    name: "Umrah reguler budget 28 juta",
    input: {
      ibadah: "Umrah",
      budget: 28_000_000,
      usia: 45,
      butuhPendampingan: false,
      preferensiHotel: "Standard",
      tipeTransportasi: "Ekonomi",
      destinasiTambahan: null,
    },
  },
  {
    key: "premium",
    name: "Umrah premium dengan pendampingan",
    input: {
      ibadah: "Umrah",
      budget: 55_000_000,
      usia: 65,
      butuhPendampingan: true,
      preferensiHotel: "Premium",
      tipeTransportasi: "Premium",
      destinasiTambahan: null,
    },
  },
  {
    key: "dubai",
    name: "Umrah plus Dubai",
    input: {
      ibadah: "Umrah",
      budget: 40_000_000,
      usia: 35,
      butuhPendampingan: false,
      preferensiHotel: "Mewah",
      tipeTransportasi: "Bisnis",
      destinasiTambahan: "Dubai",
    },
  },
  {
    key: "turki",
    name: "Umrah plus Turki",
    input: {
      ibadah: "Umrah",
      budget: 38_000_000,
      usia: 38,
      butuhPendampingan: false,
      preferensiHotel: "Premium",
      tipeTransportasi: "Bisnis",
      destinasiTambahan: "Turki",
    },
  },
  {
    key: "low-budget",
    name: "Umrah budget terlalu rendah",
    input: {
      ibadah: "Umrah",
      budget: 12_000_000,
      usia: 30,
      butuhPendampingan: false,
      preferensiHotel: "Standard",
      tipeTransportasi: "Ekonomi",
      destinasiTambahan: null,
    },
  },
];

function parseCaseArg(argv: string[]): string | null {
  const caseFlagIndex = argv.findIndex((arg) => arg === "--case" || arg === "-c");
  if (caseFlagIndex >= 0) return argv[caseFlagIndex + 1] ?? null;

  const inline = argv.find((arg) => arg.startsWith("--case="));
  if (inline) return inline.slice("--case=".length) || null;

  return null;
}

function shouldList(argv: string[]): boolean {
  return argv.includes("--list") || argv.includes("-l");
}

function shouldJson(argv: string[]): boolean {
  return argv.includes("--json") || argv.includes("-j");
}

function printList() {
  console.log("Available cases:");
  for (const sample of SAMPLES) {
    console.log(`- ${sample.key}: ${sample.name}`);
  }
}

function printUsage() {
  console.log("Usage:");
  console.log("  npx tsx scripts/test-inference.ts");
  console.log("  npx tsx scripts/test-inference.ts --case dubai");
  console.log("  npx tsx scripts/test-inference.ts --list");
  console.log("  npx tsx scripts/test-inference.ts --case dubai --json");
}

async function main() {
  const argv = process.argv.slice(2);
  const useJson = shouldJson(argv);

  if (shouldList(argv)) {
    if (useJson) {
      console.log(JSON.stringify(SAMPLES.map((item) => ({ key: item.key, name: item.name })), null, 2));
    } else {
      printList();
    }
    return;
  }

  const requestedCase = parseCaseArg(argv);
  const selected = requestedCase
    ? SAMPLES.filter((sample) => sample.key.toLowerCase() === requestedCase.toLowerCase())
    : SAMPLES;

  if (selected.length === 0) {
    console.error(`Case \"${requestedCase}\" tidak ditemukan.`);
    printUsage();
    printList();
    process.exit(1);
  }

  const rules = await loadOntologyRules();

  const outputs = selected.map((sample) => ({
    key: sample.key,
    name: sample.name,
    input: sample.input,
    result: inferRecommendations(sample.input, rules),
  }));

  if (useJson) {
    console.log(JSON.stringify(outputs, null, 2));
    return;
  }

  for (const output of outputs) {
    console.log(`=== [${output.key}] ${output.name} ===`);
    console.log(JSON.stringify(output.result, null, 2));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
