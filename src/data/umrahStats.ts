export type UmrahStatPoint = {
  year: number;
  pilgrims: number;
};

export const umrahPilgrimsPerYear: UmrahStatPoint[] = [
  { year: 2016, pilgrims: 18849736 },
  { year: 2017, pilgrims: 19079306 },
  { year: 2018, pilgrims: 18311111 },
  { year: 2019, pilgrims: 19158031 },
  { year: 2020, pilgrims: 5822942 },
  { year: 2021, pilgrims: 6499463 },
  { year: 2022, pilgrims: 24715307 },
  { year: 2023, pilgrims: 26856833 },
  { year: 2024, pilgrims: 35680000 },
  { year: 2025, pilgrims: 20660000 },
];

export const umrahStatsMeta = {
  source: "Dataset internal (input pengguna)",
  lastUpdated: "2 Maret 2026",
};
