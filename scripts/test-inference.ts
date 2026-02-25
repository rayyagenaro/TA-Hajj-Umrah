import { inferRecommendations, loadOntologyRules } from "@/lib/ontology";

async function main() {
  const rules = await loadOntologyRules();

  const samples = [
    {
      name: "Haji budget 120 juta",
      input: {
        ibadah: "Haji" as const,
        budget: 120_000_000,
        usia: 45,
        butuhPendampingan: false,
        preferensiHotel: "Standard",
        tipeTransportasi: "Ekonomi",
        destinasiTambahan: null,
      },
    },
    {
      name: "Haji budget 650 juta dengan pendampingan",
      input: {
        ibadah: "Haji" as const,
        budget: 650_000_000,
        usia: 65,
        butuhPendampingan: true,
        preferensiHotel: "Premium",
        tipeTransportasi: "Premium",
        destinasiTambahan: null,
      },
    },
    {
      name: "Umrah plus Dubai",
      input: {
        ibadah: "Umrah" as const,
        budget: 40_000_000,
        usia: 35,
        butuhPendampingan: false,
        preferensiHotel: "Mewah",
        tipeTransportasi: "Bisnis",
        destinasiTambahan: "Dubai",
      },
    },
  ];

  for (const sample of samples) {
    const result = inferRecommendations(sample.input, rules);
    console.log("===", sample.name, "===");
    console.log(result);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

