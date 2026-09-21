// ======================================================
// VIJAYATWIN AI — RISK ENGINE
// ======================================================

// HEAT RISK
// Higher temperature = higher risk
// Lower tree cover = higher risk
export function calculateHeatRisk(temperature, treeCover) {
  const temp = Number(temperature);
  const trees = Number(treeCover);

  if (Number.isNaN(temp) || Number.isNaN(trees)) {
    return 0;
  }

  const temperatureRisk = Math.max(
    0,
    Math.min(100, ((temp - 30) / 20) * 100)
  );

  const treeRisk = 100 - Math.max(0, Math.min(100, trees));

  const risk =
    temperatureRisk * 0.7 +
    treeRisk * 0.3;

  return Math.round(Math.max(0, Math.min(100, risk)));
}


// FLOOD RISK
// Higher rainfall = higher risk
// Lower drainage capacity = higher risk
export function calculateFloodRisk(rainfall, drainCapacity) {
  const rain = Number(rainfall);
  const drainage = Number(drainCapacity);

  if (Number.isNaN(rain) || Number.isNaN(drainage)) {
    return 0;
  }

  const rainfallRisk = Math.max(
    0,
    Math.min(100, (rain / 100) * 100)
  );

  const drainageRisk =
    100 - Math.max(0, Math.min(100, drainage));

  const risk =
    rainfallRisk * 0.7 +
    drainageRisk * 0.3;

  return Math.round(Math.max(0, Math.min(100, risk)));
}


// TRAFFIC RISK
export function calculateTrafficRisk(traffic) {
  const load = Number(traffic);

  if (Number.isNaN(load)) {
    return 0;
  }

  return Math.round(
    Math.max(0, Math.min(100, load))
  );
}


// OVERALL CIVIC RISK
export function calculateOverallRisk(
  heatRisk,
  floodRisk,
  trafficRisk
) {
  const heat = Number(heatRisk);
  const flood = Number(floodRisk);
  const traffic = Number(trafficRisk);

  if (
    Number.isNaN(heat) ||
    Number.isNaN(flood) ||
    Number.isNaN(traffic)
  ) {
    return 0;
  }

  const overall =
    heat * 0.3 +
    flood * 0.4 +
    traffic * 0.3;

  return Math.round(
    Math.max(0, Math.min(100, overall))
  );
}


// RISK LEVEL
export function getRiskLevel(score) {
  const value = Number(score);

  if (value >= 81) {
    return "CRITICAL";
  }

  if (value >= 61) {
    return "HIGH";
  }

  if (value >= 31) {
    return "MEDIUM";
  }

  return "LOW";
}