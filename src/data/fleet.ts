// Static fleet definition: 16 fictional vessels, Gulf of Mexico operations.
// ~11 smaller 150-170 ft coastal class, 5 larger 205-280 ft OSV class.

import type { VesselStatic } from './types';

export interface Place {
  name: string;
  lat: number;
  lon: number;
}

export const PORTS: Place[] = [
  { name: 'Port Fourchon, LA', lat: 29.11, lon: -90.2 },
  { name: 'Galveston, TX', lat: 29.31, lon: -94.79 },
  { name: 'Morgan City, LA', lat: 29.69, lon: -91.21 },
  { name: 'Mobile, AL', lat: 30.69, lon: -88.04 },
  { name: 'Corpus Christi, TX', lat: 27.81, lon: -97.4 },
  { name: 'Pascagoula, MS', lat: 30.34, lon: -88.55 },
  { name: 'Freeport, TX', lat: 28.95, lon: -95.36 },
  { name: 'Venice, LA', lat: 29.28, lon: -89.35 },
];

export const SITES: Place[] = [
  { name: 'Green Canyon 18', lat: 27.93, lon: -90.77 },
  { name: 'Mississippi Canyon 252', lat: 28.74, lon: -88.39 },
  { name: 'Garden Banks 426', lat: 27.59, lon: -92.49 },
  { name: 'Eugene Island 330', lat: 28.27, lon: -91.39 },
  { name: 'High Island A-389', lat: 28.09, lon: -93.61 },
  { name: 'Ship Shoal 207', lat: 28.61, lon: -90.92 },
  { name: 'Alaminos Canyon 25', lat: 26.93, lon: -94.69 },
  { name: 'Viosca Knoll 786', lat: 29.07, lon: -88.05 },
];

export function place(name: string): Place {
  const p = PORTS.find((x) => x.name === name) ?? SITES.find((x) => x.name === name);
  if (!p) throw new Error(`unknown place: ${name}`);
  return p;
}

const COASTAL = {
  class: 'COASTAL' as const,
  cruise_kn: 10.5,
  main_max_gph: 78, // ~1500 hp main at full load
  gen_max_gph: 14,
  storage_capacity_gal: 12_000,
  feeder_capacity_gal: 2_500,
};

const OSV = {
  class: 'OSV' as const,
  cruise_kn: 12.5,
  main_max_gph: 152, // ~3000 hp main at full load
  gen_max_gph: 26,
  storage_capacity_gal: 30_000,
  feeder_capacity_gal: 6_000,
};

function vessel(
  id: string,
  name: string,
  length_ft: number,
  base: typeof COASTAL | typeof OSV,
  home_ports: string[],
  extra: Partial<VesselStatic> = {},
): VesselStatic {
  return {
    id,
    name,
    length_ft,
    ...base,
    home_ports,
    schedule_profile: 'standard',
    scripted: {},
    ...extra,
  };
}

export const VESSELS: VesselStatic[] = [
  // ---- 205-280 ft OSV class (5) ----
  // §9 anomaly vessel: transit-heavy schedule, Engine 2 injector-fouling script.
  vessel('v01', 'Meridian', 240, OSV, ['Port Fourchon, LA', 'Galveston, TX'], {
    schedule_profile: 'transit_heavy',
    scripted: { anomaly: true },
  }),
  vessel('v02', 'Gulf Harrier', 260, OSV, ['Port Fourchon, LA', 'Venice, LA']),
  vessel('v03', 'Marlin Ridge', 220, OSV, ['Galveston, TX', 'Freeport, TX']),
  vessel('v04', 'Frigate Bird', 280, OSV, ['Port Fourchon, LA', 'Morgan City, LA']),
  vessel('v05', 'Albatross', 205, OSV, ['Mobile, AL', 'Pascagoula, MS']),
  // ---- 150-170 ft coastal class (11) ----
  vessel('v06', 'Pelican Star', 150, COASTAL, ['Port Fourchon, LA']),
  vessel('v07', 'Bayou Runner', 155, COASTAL, ['Morgan City, LA', 'Port Fourchon, LA']),
  vessel('v08', 'Sandpiper', 150, COASTAL, ['Galveston, TX']),
  vessel('v09', 'Kestrel Bay', 160, COASTAL, ['Freeport, TX', 'Galveston, TX']),
  // Scripted sensor disagreement: flow meter reads ~5% high → reconciliation DISAGREE.
  vessel('v10', 'Cormorant', 165, COASTAL, ['Venice, LA', 'Port Fourchon, LA'], {
    scripted: { flow_meter_bias: 1.05 },
  }),
  vessel('v11', 'Terrebonne', 170, COASTAL, ['Morgan City, LA']),
  vessel('v12', 'Blue Heron', 155, COASTAL, ['Mobile, AL']),
  // Scripted satellite drop: weather feed stale ~45 min → STALE state demo.
  vessel('v13', 'Sabine', 165, COASTAL, ['Corpus Christi, TX', 'Freeport, TX'], {
    scripted: { stale_weather: true },
  }),
  vessel('v14', 'Osprey Point', 160, COASTAL, ['Pascagoula, MS', 'Mobile, AL']),
  vessel('v15', 'Calcasieu', 150, COASTAL, ['Port Fourchon, LA', 'Venice, LA']),
  vessel('v16', 'Petrel', 170, COASTAL, ['Corpus Christi, TX']),
];

// Crew name pools (fictional).
export const FIRST_NAMES = [
  'James', 'Robert', 'Maria', 'David', 'Carlos', 'Linda', 'Thanh', 'Michael',
  'Dale', 'Curtis', 'Andre', 'Felipe', 'Wayne', 'Travis', 'Gloria', 'Russell',
  'Dwayne', 'Hector', 'Marcus', 'Earl', 'Vern', 'Octavio', 'Lloyd', 'Pham',
];
export const LAST_NAMES = [
  'Boudreaux', 'Nguyen', 'Thibodaux', 'Garcia', 'Johnson', 'LeBlanc', 'Hardy',
  'Fontenot', 'Ramirez', 'Pitre', 'Walker', 'Broussard', 'Tran', 'Daigle',
  'Morrison', 'Ortiz', 'Granger', 'Babineaux', 'Sonnier', 'Knight', 'Vidrine',
  'Calloway', 'Hebert', 'Dardar',
];

export function distanceNm(a: Place, b: Place): number {
  const R = 3440.065; // earth radius, nm
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la = (a.lat * Math.PI) / 180;
  const lb = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function bearingDeg(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const la = (a.lat * Math.PI) / 180;
  const lb = (b.lat * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lb);
  const x = Math.cos(la) * Math.sin(lb) - Math.sin(la) * Math.cos(lb) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
