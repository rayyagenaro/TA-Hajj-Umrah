import test from "node:test";
import assert from "node:assert/strict";
import { travelPackagesByType } from "../src/data/travelPackages";
import { rankPackagesByProfile } from "../src/app/rekomendasi/profileMatching";
import type { FormState } from "../src/app/rekomendasi/types";

const baseForm: FormState = {
  budget: 35_000_000,
  usia: 40,
  preferJarakHotelMaks: 500,
  durasiPreferensi: 13,
  tipePenerbangan: "transit",
  butuhPendampingan: "tidak",
  preferensiHotel: "Standard",
  tipeTransportasi: "Ekonomi",
  destinasiTambahan: "none",
  nama: "Test Durasi",
};

test("profile matching prioritizes reguler packages with duration closer to 13 days", () => {
  const ranked = rankPackagesByProfile(travelPackagesByType.UmrahReguler, baseForm, 5);

  assert.ok(ranked.length > 0);
  assert.match(ranked[0].duration ?? "", /13/i);

  const shorterPackage = ranked.find((pkg) => /9 Hari|9 Day/i.test(pkg.duration ?? ""));
  const longerPackage = ranked.find((pkg) => /13 Hari|13 Day/i.test(pkg.duration ?? ""));

  assert.ok(shorterPackage);
  assert.ok(longerPackage);
  assert.ok((longerPackage?.score.durasi ?? 0) > (shorterPackage?.score.durasi ?? 0));
});

test("profile matching for 12 days does not prioritize shorter 9-day packages over closer durations", () => {
  const ranked = rankPackagesByProfile(
    travelPackagesByType.UmrahReguler,
    { ...baseForm, durasiPreferensi: 12, budget: 33_000_000 },
    5,
  );

  assert.ok(ranked.length > 0);

  const topDuration = ranked[0]?.duration ?? "";
  assert.match(topDuration, /12|13/i);

  const shorterPackage = ranked.find((pkg) => /9 Hari|9 Day/i.test(pkg.duration ?? ""));
  const closerPackage = ranked.find((pkg) => /12 Hari|13 Hari|12 Day|13 Day/i.test(pkg.duration ?? ""));

  assert.ok(shorterPackage);
  assert.ok(closerPackage);
  assert.ok((closerPackage?.score.total ?? 0) >= (shorterPackage?.score.total ?? 0));
});
