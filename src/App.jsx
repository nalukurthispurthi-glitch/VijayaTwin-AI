import { useEffect, useMemo, useState } from "react";
import Chatbot from "./Chatbot";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import {
  FiActivity,
  FiCloudRain,
  FiThermometer,
  FiDroplet,
  FiZap,
  FiShield,
  FiRotateCcw,
  FiCheckCircle,
  FiTarget,
  FiBell,
  FiUsers,
  FiMapPin,
  FiSend,
  FiArrowUpRight,
  FiClock,
  FiRadio,
  FiAlertTriangle,
  FiChevronRight,
  FiEye,
  FiMessageSquare,
} from "react-icons/fi";
import "leaflet/dist/leaflet.css";
import "./App.css";

const vijayawadaZones = [
  {
    name: "Benz Circle",
    lat: 16.4975,
    lng: 80.6436,
    riskFactor: 1.18,
    civic: "High",
    heat: "High",
    flood: "Medium",
  },
  {
    name: "PNBS",
    lat: 16.5193,
    lng: 80.6205,
    riskFactor: 1.12,
    civic: "High",
    heat: "Medium",
    flood: "High",
  },
  {
    name: "Eluru Road",
    lat: 16.5178,
    lng: 80.6378,
    riskFactor: 1.08,
    civic: "High",
    heat: "High",
    flood: "Medium",
  },
  {
    name: "Bandar Road",
    lat: 16.4989,
    lng: 80.6585,
    riskFactor: 1.05,
    civic: "Medium",
    heat: "High",
    flood: "Medium",
  },
  {
    name: "Gunadala",
    lat: 16.5266,
    lng: 80.6658,
    riskFactor: 0.98,
    civic: "Medium",
    heat: "Medium",
    flood: "Medium",
  },
  {
    name: "Moghalrajpuram",
    lat: 16.5055,
    lng: 80.6505,
    riskFactor: 1.03,
    civic: "Medium",
    heat: "High",
    flood: "Medium",
  },
  {
    name: "Labbipet",
    lat: 16.4956,
    lng: 80.6412,
    riskFactor: 1.1,
    civic: "High",
    heat: "High",
    flood: "High",
  },
  {
    name: "One Town",
    lat: 16.514,
    lng: 80.611,
    riskFactor: 0.96,
    civic: "Medium",
    heat: "Medium",
    flood: "High",
  },
];

const preventionData = {
  heavyRain: {
    title: "Waterlogging Risk Detected",
    description:
      "AI predicts increasing flood pressure across vulnerable drainage zones.",
    actions: [
      "Inspect drainage hotspots",
      "Clear vulnerable drain points",
      "Protect emergency corridors",
    ],
    reduction: 27,
    priority: "IMMEDIATE",
  },
  heatwave: {
    title: "Extreme Heat Exposure",
    description:
      "High temperature and low vegetation increase outdoor heat exposure.",
    actions: [
      "Activate water stations",
      "Provide shaded rest zones",
      "Protect outdoor workers",
      "Send heat-risk notifications",
    ],
    reduction: 24,
    priority: "HIGH",
  },
  greenCity: {
    title: "Preventive Intervention Active",
    description:
      "Green infrastructure is reducing heat and drainage pressure.",
    actions: [
      "Maintain green corridors",
      "Protect drainage infrastructure",
      "Expand shaded pedestrian zones",
      "Continue environmental monitoring",
    ],
    reduction: 31,
    priority: "LOW",
  },
  normal: {
    title: "City Conditions Stable",
    description:
      "Current signals do not indicate an immediate critical intervention.",
    actions: [
      "Continue monitoring",
      "Track weather changes",
      "Maintain emergency readiness",
    ],
    reduction: 0,
    priority: "MONITOR",
  },
  custom: {
    title: "Custom Scenario Active",
    description:
      "The Digital Twin is evaluating a user-defined city scenario.",
    actions: [
      "Review simulated risk",
      "Inspect vulnerable zones",
      "Evaluate prevention options",
      "Continue monitoring",
    ],
    reduction: 15,
    priority: "ANALYZE",
  },
};

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function calculateHeatRisk(temp, treeCover) {
  const temperatureRisk = clamp(((temp - 25) / 25) * 100);
  const vegetationPenalty = 100 - treeCover;

  return Math.round(
    temperatureRisk * 0.75 + vegetationPenalty * 0.25
  );
}

function calculateFloodRisk(rainfall, drainCapacity) {
  const rainfallRisk = clamp(rainfall);
  const drainageRisk = 100 - drainCapacity;

  return Math.round(rainfallRisk * 0.7 + drainageRisk * 0.3);
}

function calculateOverallRisk(heat, flood) {
  return Math.round(heat * 0.45 + flood * 0.55);
}

function getRiskLevel(value) {
  if (value >= 81) return "CRITICAL";
  if (value >= 61) return "HIGH";
  if (value >= 31) return "MEDIUM";
  return "LOW";
}

function getRiskColor(value) {
  if (value >= 81) return "#fb4b5f";
  if (value >= 61) return "#ff9f43";
  if (value >= 31) return "#f4c95d";
  return "#43d89b";
}

function getPriority(value) {
  if (value >= 81) return "IMMEDIATE";
  if (value >= 61) return "HIGH";
  if (value >= 31) return "MONITOR";
  return "LOW";
}

function MapResize() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 300);
  }, [map]);

  return null;
}

function App() {
  const [mode, setMode] = useState("overall");

  const [temperature, setTemperature] = useState(42);
  const [rainfall, setRainfall] = useState(20);
  const [drainCapacity, setDrainCapacity] = useState(55);
  const [treeCover, setTreeCover] = useState(25);

  const [scenario, setScenario] = useState("normal");
  const [citizenReports, setCitizenReports] = useState([
  {
    id: 1,
    type: "Waterlogging",
    location: "Benz Circle",
    description: "Water accumulation reported near the main junction.",
    priority: "HIGH",
    status: "UNDER REVIEW",
    time: "2 min ago",
  },
  {
    id: 2,
    type: "Blocked Drain",
    location: "Labbipet",
    description: "Drainage flow appears restricted after rainfall.",
    priority: "MEDIUM",
    status: "RECEIVED",
    time: "8 min ago",
  },
]);
const [reportType, setReportType] = useState("Waterlogging");
const [reportLocation, setReportLocation] = useState("Benz Circle");
const [reportDescription, setReportDescription] = useState("");
const [reportSubmitted, setReportSubmitted] = useState(false);

const citizenRiskImpact = useMemo(() => {
  const activeReports = citizenReports.filter(
    (report) => report.status !== "RESOLVED"
  );

  const waterloggingReports = activeReports.filter(
    (report) => report.type === "Waterlogging"
  ).length;

  const blockedDrainReports = activeReports.filter(
    (report) => report.type === "Blocked Drain"
  ).length;

  const emergencyReports = activeReports.filter(
    (report) => report.type === "Emergency"
  ).length;

  return {
    waterloggingReports,
    blockedDrainReports,
    emergencyReports,
    total: activeReports.length,
  };
}, [citizenReports]);
  const [baselineSnapshot, setBaselineSnapshot] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataMode, setDataMode] = useState("live");

  const [sentAlerts, setSentAlerts] = useState([]);

  const fetchLiveWeather = async () => {
    try {
      setWeatherLoading(true);
      setWeatherError("");

      const url =
        "https://api.open-meteo.com/v1/forecast?latitude=16.5062&longitude=80.6480&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,weather_code&timezone=Asia%2FKolkata";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Weather service unavailable");
      }

      const data = await response.json();
      const current = data.current;

      const weather = {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        rain: current.rain,
        wind: current.wind_speed_10m,
        weatherCode: current.weather_code,
        time: current.time,
      };

      setLiveWeather(weather);
      setLastUpdated(new Date());

      if (dataMode === "live") {
        setTemperature(Math.round(weather.temperature));
        setRainfall(Math.round(weather.rain * 10));
      }
    } catch (error) {
      setWeatherError("Live weather unavailable");
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveWeather();

    const interval = setInterval(fetchLiveWeather, 60000);

    return () => clearInterval(interval);
  }, [dataMode]);

  const getWeatherDescription = (code) => {
    const descriptions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Light rain",
      63: "Moderate rain",
      65: "Heavy rain",
      80: "Rain showers",
      81: "Moderate showers",
      82: "Violent showers",
      95: "Thunderstorm",
    };

    return descriptions[code] || "Current conditions";
  };

  const applyScenario = (type) => {
  // Save the current state as the baseline before applying a new scenario
  if (type !== "normal" && !baselineSnapshot) {
    setBaselineSnapshot({
      temperature,
      rainfall,
      drainCapacity,
      treeCover,
      heat: heatRisk,
      flood: floodRisk,
      overall: overallRisk,
    });
  }

  setScenario(type);
    setDataMode("simulation");

    if (type === "normal") {
      if (liveWeather) {
        setTemperature(Math.round(liveWeather.temperature));
        setRainfall(Math.round(liveWeather.rain * 10));
      }
      setDrainCapacity(55);
      setTreeCover(25);
    }

    if (type === "heavyRain") {
      setTemperature(42);
      setRainfall(85);
      setDrainCapacity(45);
      setTreeCover(25);
    }

    if (type === "heatwave") {
      setTemperature(48);
      setRainfall(5);
      setDrainCapacity(60);
      setTreeCover(15);
    }


    if (type === "greenCity") {
      setTemperature(38);
      setRainfall(20);
      setDrainCapacity(75);
      setTreeCover(65);
    }
  };

 const resetSimulation = () => {
  setBaselineSnapshot(null);
  applyScenario("normal");
  setSelectedZone(null);
};
const submitCitizenReport = (event) => {
  event.preventDefault();

  if (!reportDescription.trim()) return;

  const priority =
    reportType === "Emergency"
      ? "CRITICAL"
      : reportType === "Waterlogging"
      ? "HIGH"
      : "MEDIUM";

  const newReport = {
    id: Date.now(),
    type: reportType,
    location: reportLocation,
    description: reportDescription,
    priority,
    status: "RECEIVED",
    time: "Just now",
  };

  setCitizenReports((previous) => [newReport, ...previous]);
  setReportDescription("");
  setReportSubmitted(true);

  setTimeout(() => {
    setReportSubmitted(false);
  }, 3000);
};

  const heatRisk = calculateHeatRisk(temperature, treeCover);
  const floodRisk = calculateFloodRisk(rainfall, drainCapacity);
  const overallRisk = calculateOverallRisk(heatRisk, floodRisk);

  const getZoneCitizenImpact = (zoneName) => {
  const reports = citizenReports.filter(
    (report) =>
      report.location === zoneName &&
      report.status !== "RESOLVED"
  );

  const waterlogging = reports.filter(
    (report) => report.type === "Waterlogging"
  ).length;

  const blockedDrains = reports.filter(
    (report) => report.type === "Blocked Drain"
  ).length;

  const emergencies = reports.filter(
    (report) => report.type === "Emergency"
  ).length;

  return {
    reportCount: reports.length,
    impact:
      waterlogging * 4 +
      blockedDrains * 3 +
      emergencies * 5,
  };
};

  const whatIfComparison = useMemo(() => {
  if (!baselineSnapshot) return null;

  return {
    heatDelta: heatRisk - baselineSnapshot.heat,
    floodDelta: floodRisk - baselineSnapshot.flood,
    overallDelta:
      overallRisk - baselineSnapshot.overall,
  };
}, [
  baselineSnapshot,
  heatRisk,
  floodRisk,
  overallRisk,
]);

  const getZoneRisk = (zone) => {
    const heat = clamp(Math.round(heatRisk * zone.riskFactor));
    const flood = clamp(Math.round(floodRisk * zone.riskFactor));
    const overall = clamp(
      Math.round(
        heat * 0.45 +
          flood * 0.55
      )
    );

    return {
      heat,
      flood,
      overall,
    };
  };

  const activeRisk = {
    heat: heatRisk,
    flood: floodRisk,
    overall: overallRisk,
  };

  const predictionTimeline = useMemo(() => {
    const scenarioMultiplier = {
      normal: 1,
      heavyRain: 1.25,
      heatwave: 1.15,
      greenCity: 0.7,
      custom: 1,
    }[scenario];

    const points = [
      { label: "NOW", factor: 1 },
      { label: "+30 MIN", factor: 1.08 },
      { label: "+1 HR", factor: 1.16 },
      { label: "+2 HR", factor: 1.24 },
    ];

    return points.map((point, index) => {
      const rainfallPressure =
        rainfall * 0.3 * index * scenarioMultiplier;

      const heatPressure =
        Math.max(0, temperature - 30) *
        0.25 *
        index *
        scenarioMultiplier;

      const drainagePressure =
        (100 - drainCapacity) *
        0.15 *
        index;

      const vegetationPressure =
        (100 - treeCover) *
        0.1 *
        index;

      const predictedHeat = clamp(
        Math.round(
          heatRisk +
            heatPressure +
            vegetationPressure * 0.2
        )
      );

      const predictedFlood = clamp(
        Math.round(
          floodRisk +
            rainfallPressure +
            drainagePressure
        )
      );


      const predictedOverall = clamp(
        Math.round(
          predictedHeat * 0.45 +
            predictedFlood * 0.55
        )
      );

      return {
        ...point,
        heat: predictedHeat,
        flood: predictedFlood,
        overall: predictedOverall,
      };
    });
  }, [
    heatRisk,
    floodRisk,
    rainfall,
    temperature,
    drainCapacity,
    treeCover,
    scenario,
  ]);

  const predictionInsight = useMemo(() => {
    const now = predictionTimeline[0].overall;
    const future = predictionTimeline[3].overall;
    const difference = future - now;

    if (difference >= 10) {
      return {
        type: "rising",
        text: `AI predicts overall civic risk may rise by ${difference} points within the next 2 hours.`,
      };
    }

    if (difference <= -10) {
      return {
        type: "improving",
        text: `AI predicts overall civic risk may improve by ${Math.abs(
          difference
        )} points within the next 2 hours.`,
      };
    }

    return {
      type: "stable",
      text: "AI predicts relatively stable city conditions over the next 2 hours.",
    };
  }, [predictionTimeline]);

  const preventionPlanner = useMemo(() => {
    const zoneRisks = vijayawadaZones
      .map((zone) => ({
        ...zone,
        ...getZoneRisk(zone),
      }))
      .sort((a, b) => b.overall - a.overall);

    const highestHeatZone = [...zoneRisks].sort(
      (a, b) => b.heat - a.heat
    )[0];

    const highestFloodZone = [...zoneRisks].sort(
      (a, b) => b.flood - a.flood
    )[0];


    const plans = [];

    if (floodRisk >= 31) {
      plans.push({
        id: "flood",
        category: "FLOOD PREVENTION",
        priority: getPriority(floodRisk),
        risk: floodRisk,
        zone: highestFloodZone.name,
        action: "Inspect drainage hotspots and prepare alternate corridors.",
        department: "Civic & Drainage Team",
        target: "Drainage Network",
        impact: preventionData.heavyRain.reduction,
        icon: "flood",
      });
    }

    if (heatRisk >= 31) {
      plans.push({
        id: "heat",
        category: "HEAT PROTECTION",
        priority: getPriority(heatRisk),
        risk: heatRisk,
        zone: highestHeatZone.name,
        action: "Activate water stations and shaded pedestrian rest points.",
        department: "Public Health Team",
        target: "Outdoor Population",
        impact: preventionData.heatwave.reduction,
        icon: "heat",
      });
    }

    if (treeCover >= 50 && drainCapacity >= 65 && scenario === "greenCity") {
      plans.push({
        id: "green",
        category: "GREEN INFRASTRUCTURE",
        priority: "LOW",
        risk: overallRisk,
        zone: zoneRisks[0].name,
        action: "Maintain green corridors and protect existing drainage infrastructure.",
        department: "Urban Environment",
        target: "Green Corridors",
        impact: preventionData.greenCity.reduction,
        icon: "green",
      });
    }

    if (plans.length === 0) {
      plans.push({
        id: "readiness",
        category: "CITY READINESS",
        priority: "MONITOR",
        risk: overallRisk,
        zone: zoneRisks[0].name,
        action: "Continue monitoring weather, heat and civic conditions.",
        department: "City Operations",
        target: "Citywide",
        impact: 0,
        icon: "ready",
      });
    }

    const priorityOrder = {
      IMMEDIATE: 1,
      HIGH: 2,
      MONITOR: 3,
      ANALYZE: 4,
      LOW: 5,
    };

    plans.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    const priorityZones = zoneRisks.filter(
      (zone) => zone.overall >= 61
    ).length;

    const totalImpact = Math.min(
      99,
      plans.reduce((sum, plan) => sum + plan.impact, 0)
    );

    return {
      plans,
      priorityZones,
      totalImpact,
    };
  }, [
    heatRisk,
    floodRisk,
    overallRisk,
    treeCover,
    drainCapacity,
    scenario,
  ]);

  const alerts = useMemo(() => {
    const generated = [];

    if (floodRisk >= 61) {
      const zone = [...vijayawadaZones]
        .sort(
          (a, b) =>
            getZoneRisk(b).flood -
            getZoneRisk(a).flood
        )[0];

      generated.push({
        id: "flood-alert",
        priority: getPriority(floodRisk),
        type: "FLOOD RISK",
        audience: "Citizens",
        zone: zone.name,
        title: "Waterlogging risk increasing",
        message: `AI detects elevated waterlogging pressure around ${zone.name}.`,
        action:
          "Avoid low-lying routes and use alternate corridors.",
      });
    }

    if (heatRisk >= 61) {
      const zone = [...vijayawadaZones]
        .sort(
          (a, b) =>
            getZoneRisk(b).heat -
            getZoneRisk(a).heat
        )[0];

      generated.push({
        id: "heat-alert",
        priority: getPriority(heatRisk),
        type: "HEAT RISK",
        audience: "Outdoor Workers",
        zone: zone.name,
        title: "Extreme heat exposure detected",
        message: `AI identifies high heat exposure around ${zone.name}.`,
        action:
          "Use shaded areas, hydrate frequently and reduce prolonged outdoor exposure.",
      });
    }


    if (overallRisk >= 61) {
      generated.push({
        id: "civic-alert",
        priority: getPriority(overallRisk),
        type: "CIVIC ALERT",
        audience: "Civic Teams",
        zone: "Citywide",
        title: "Preventive action recommended",
        message:
          "The AI engine has identified elevated combined civic risk.",
        action:
          "Review the Prevention Planner and activate priority interventions.",
      });
    }

    return generated;
  }, [heatRisk, floodRisk, overallRisk]);

  const sendAlert = (id) => {
    setSentAlerts((current) =>
      current.includes(id)
        ? current
        : [...current, id]
    );
  };

  const getPlannerIcon = (icon) => {
    if (icon === "flood") return <FiDroplet />;
    if (icon === "heat") return <FiThermometer />;
    if (icon === "green") return <FiShield />;
    return <FiCheckCircle />;
  };

  const scrollToSection = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <FiZap />
          </div>

          <div>
            <h1>VijayaTwin</h1>
            <span>AI CIVIC INTELLIGENCE</span>
          </div>
        </div>

        <div className="live-pill">
          <span className="live-dot"></span>
          SYSTEM ONLINE
        </div>

        <nav className="side-nav">
          <button
            className="nav-item active"
            onClick={() => scrollToSection("overview")}
          >
            <FiActivity />
            <span>Overview</span>
          </button>

          <button
            className="nav-item"
            onClick={() => scrollToSection("prediction")}
          >
            <FiTarget />
            <span>AI Prediction</span>
          </button>

          <button
            className="nav-item"
            onClick={() => scrollToSection("map")}
          >
            <FiMapPin />
            <span>Risk Map</span>
          </button>

          <button
            className="nav-item"
            onClick={() => scrollToSection("prevention")}
          >
            <FiShield />
            <span>Action Center</span>
          </button>

          <button
            className="nav-item"
            onClick={() => scrollToSection("alerts")}
          >
            <FiBell />
            <span>Citizen Alerts</span>
            {alerts.length > 0 && (
              <b>{alerts.length}</b>
            )}
          </button>
         <button
  className="nav-item"
  onClick={() => scrollToSection("citizen-reports")}
>
  <FiMessageSquare />
  <span>Citizen Reports</span>
  {citizenReports.length > 0 && <b>{citizenReports.length}</b>}
</button>
          <button
            className="nav-item"
            onClick={() => scrollToSection("digital-twin")}
          >
            <FiRadio />
            <span>Digital Twin</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="mini-system">
            <div className="mini-system-icon">
              <FiRadio />
            </div>
            <div>
              <strong>Vijayawada</strong>
              <small>Urban twin active</small>
            </div>
          </div>

          <div className="sidebar-version">
            VIJAYATWIN AI · v1.0
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <div>
            <div className="eyebrow">
              <span></span>
              PREDICTIVE CIVIC INTELLIGENCE
            </div>

            <h2>
              Vijayawada
              <em> / Digital City Twin</em>
            </h2>

            <p>
              Predict the city. Simulate the future. Protect the people.
            </p>
          </div>

          <div className="topbar-actions">
            <div className="weather-chip">
              <FiThermometer />
              <div>
                <strong>
                  {liveWeather
                    ? `${Math.round(
                        liveWeather.temperature
                      )}°C`
                    : "--"}
                </strong>
                <span>
                  {liveWeather
                    ? getWeatherDescription(
                        liveWeather.weatherCode
                      )
                    : "Loading"}
                </span>
              </div>
            </div>

            <div className="data-chip">
              <span
                className={
                  dataMode === "live"
                    ? "status-dot"
                    : "status-dot simulation"
                }
              ></span>

              {dataMode === "live"
                ? "LIVE DATA"
                : "SIMULATION"}
            </div>
          </div>
        </header>

        {/* OVERVIEW */}
        <section id="overview" className="hero-section">
          <div className="hero-copy">
            <div className="hero-label">
              <FiRadio />
              CITY INTELLIGENCE CORE
            </div>

            <h3>
              See tomorrow's
              <br />
              <span>city risks today.</span>
            </h3>

            <p>
              VijayaTwin AI combines environmental signals,
              environmental signals and urban infrastructure data
              to predict emerging civic risks before they become
              emergencies.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() =>
                  scrollToSection("prediction")
                }
              >
                Explore Prediction
                <FiArrowUpRight />
              </button>

              <button
                className="ghost-button"
                onClick={() =>
                  scrollToSection("digital-twin")
                }
              >
                Open Digital Twin
              </button>
            </div>
          </div>

          <div className="hero-orbit">
            <div className="orbit orbit-one"></div>
            <div className="orbit orbit-two"></div>
            <div className="orbit orbit-three"></div>

            <div className="orbit-core">
              <div className="core-icon">
                <FiZap />
              </div>
              <strong>{overallRisk}</strong>
              <span>OVERALL RISK</span>
            </div>

            <div className="orbit-point point-one">
              <FiThermometer />
            </div>

            <div className="orbit-point point-two">
              <FiDroplet />
            </div>

          </div>
        </section>

        {/* RISK CARDS */}
        <section className="risk-grid">
          <RiskCard
            icon={<FiThermometer />}
            label="HEAT RISK"
            value={heatRisk}
            level={getRiskLevel(heatRisk)}
            color={getRiskColor(heatRisk)}
            meta={`${temperature}°C · ${treeCover}% tree cover`}
            active={mode === "heat"}
            onClick={() => setMode("heat")}
          />

          <RiskCard
            icon={<FiDroplet />}
            label="FLOOD RISK"
            value={floodRisk}
            level={getRiskLevel(floodRisk)}
            color={getRiskColor(floodRisk)}
            meta={`${rainfall}% rain pressure · ${drainCapacity}% drainage`}
            active={mode === "flood"}
            onClick={() => setMode("flood")}
          />


          <RiskCard
            icon={<FiActivity />}
            label="CIVIC RISK"
            value={overallRisk}
            level={getRiskLevel(overallRisk)}
            color={getRiskColor(overallRisk)}
            meta="Combined AI assessment"
            active={mode === "overall"}
            onClick={() => setMode("overall")}
            featured
          />
        </section>

        {/* PREDICTION */}
        <section id="prediction" className="section-block">
          <SectionHeading
            eyebrow="AI FORECAST ENGINE"
            title="Prediction Timeline"
            description="How city risk may evolve over the next two hours."
          />

          <div className="prediction-layout">
            <div className="prediction-timeline">
              {predictionTimeline.map(
                (point, index) => (
                  <div
                    className={`timeline-card ${
                      index === 0 ? "current" : ""
                    }`}
                    key={point.label}
                  >
                    <div className="timeline-top">
                      <span>{point.label}</span>

                      {index === 0 && (
                        <small>LIVE</small>
                      )}
                    </div>

                    <div
                      className="timeline-risk"
                      style={{
                        color: getRiskColor(
                          point.overall
                        ),
                      }}
                    >
                      {point.overall}
                    </div>

                    <span className="timeline-level">
                      {getRiskLevel(point.overall)}
                    </span>

                    <div className="mini-bars">
                      <div>
                        <span>Heat</span>
                        <i
                          style={{
                            width: `${point.heat}%`,
                          }}
                        ></i>
                      </div>

                      <div>
                        <span>Flood</span>
                        <i
                          style={{
                            width: `${point.flood}%`,
                          }}
                        ></i>
                      </div>

                    </div>
                  </div>
                )
              )}
            </div>

            <div className="prediction-insight">
              <div className="insight-icon">
                <FiTarget />
              </div>

              <div>
                <span>AI INSIGHT</span>

                <h4>
                  {predictionInsight.type ===
                  "rising"
                    ? "Risk trajectory is rising"
                    : predictionInsight.type ===
                      "improving"
                    ? "Risk trajectory is improving"
                    : "Risk trajectory is stable"}
                </h4>

                <p>
                  {predictionInsight.text}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TREND */}
        <section className="section-block">
          <SectionHeading
            eyebrow="PREDICTIVE ANALYTICS"
            title="AI Risk Trend"
            description="Projected heat and flood risk movement across the city."
          />

          <div className="trend-card">
            <div className="trend-legend">
              <Legend
                label="Overall"
                value={overallRisk}
              />
              <Legend
                label="Heat"
                value={heatRisk}
              />
              <Legend
                label="Flood"
                value={floodRisk}
              />
            </div>

            <div className="trend-chart">
              <div className="chart-grid">
                {[100, 75, 50, 25, 0].map(
                  (number) => (
                    <div
                      key={number}
                      className="grid-line"
                    >
                      <span>{number}</span>
                      <i></i>
                    </div>
                  )
                )}
              </div>

              <svg
                viewBox="0 0 1000 300"
                preserveAspectRatio="none"
              >
                <TrendLine
                  data={predictionTimeline}
                  keyName="overall"
                  stroke="#ffffff"
                  width={4}
                />

                <TrendLine
                  data={predictionTimeline}
                  keyName="heat"
                  stroke="#ff8a65"
                  width={2}
                />

                <TrendLine
                  data={predictionTimeline}
                  keyName="flood"
                  stroke="#60a5fa"
                  width={2}
                />

              </svg>

              <div className="chart-labels">
                {predictionTimeline.map(
                  (point) => (
                    <span key={point.label}>
                      {point.label}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* PREVENTION */}
        <section
          id="prevention"
          className="section-block"
        >
          <SectionHeading
            eyebrow="PREDICT → PREVENT"
            title="AI Prevention Planner"
            description="Turning predicted risks into actionable city interventions."
          />

          <div className="planner-summary">
            <div className="planner-summary-card">
              <span>PRIORITY ZONES</span>
              <strong>
                {preventionPlanner.priorityZones}
              </strong>
              <small>
                Zones requiring attention
              </small>
            </div>

            <div className="planner-summary-card">
              <span>INTERVENTIONS</span>
              <strong>
                {preventionPlanner.plans.length}
              </strong>
              <small>
                AI-generated action plans
              </small>
            </div>

            <div className="planner-summary-card accent">
              <span>EST. RISK REDUCTION</span>
              <strong>
                {preventionPlanner.totalImpact}%
              </strong>
              <small>
                Simulated prevention impact
              </small>
            </div>
          </div>

          <div className="planner-list">
            {preventionPlanner.plans.map(
              (plan) => (
                <div
                  className="planner-card"
                  key={plan.id}
                >
                  <div className="planner-icon">
                    {getPlannerIcon(
                      plan.icon
                    )}
                  </div>

                  <div className="planner-main">
                    <div className="planner-card-top">
                      <div>
                        <span className="planner-category">
                          {plan.category}
                        </span>

                        <h4>{plan.zone}</h4>
                      </div>

                      <span
                        className={`priority-pill ${plan.priority.toLowerCase()}`}
                      >
                        {plan.priority}
                      </span>
                    </div>

                    <p className="planner-action">
                      {plan.action}
                    </p>

                    <div className="planner-footer">
                      <span>
                        <FiUsers />
                        {plan.department}
                      </span>

                      <span>
                        <FiTarget />
                        {plan.target}
                      </span>

                      <strong>
                        +{plan.impact}% impact
                      </strong>

                      <button
                        onClick={() => {
                          const zone =
                            vijayawadaZones.find(
                              (item) =>
                                item.name ===
                                plan.zone
                            );

                          setSelectedZone(zone);
                          scrollToSection("map");
                        }}
                      >
                        View Zone
                        <FiChevronRight />
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="simulation-note">
            <FiAlertTriangle />
            Prevention impact is a simulated estimate for
            demonstration purposes.
          </div>
        </section>

        {/* ALERTS */}
        <section
          id="alerts"
          className="section-block"
        >
          <SectionHeading
            eyebrow="CIVIC COMMUNICATION"
            title="AI Citizen Alert System"
            description="Convert predicted risk into targeted preventive communication."
          />

          <div className="alert-summary">
            <div className="alert-stat">
              <div className="stat-icon">
                <FiBell />
              </div>
              <div>
                <span>ALERTS GENERATED</span>
                <strong>{alerts.length}</strong>
              </div>
            </div>

            <div className="alert-stat">
              <div className="stat-icon">
                <FiUsers />
              </div>
              <div>
                <span>AUDIENCE GROUPS</span>
                <strong>
                  {new Set(
                    alerts.map(
                      (alert) =>
                        alert.audience
                    )
                  ).size}
                </strong>
              </div>
            </div>

            <div className="alert-stat">
              <div className="stat-icon">
                <FiRadio />
              </div>
              <div>
                <span>STATUS</span>
                <strong>
                  {sentAlerts.length > 0
                    ? "ACTIVE"
                    : "READY"}
                </strong>
              </div>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="empty-alert">
              <FiCheckCircle />
              <h4>No high-priority alerts</h4>
              <p>
                Current conditions do not require an
                elevated citizen alert.
              </p>
            </div>
          ) : (
            <div className="alert-list">
              {alerts.map((alert) => {
                const sent =
                  sentAlerts.includes(
                    alert.id
                  );

                return (
                  <div
                    className={`alert-card ${
                      sent ? "sent" : ""
                    }`}
                    key={alert.id}
                  >
                    <div className="alert-card-top">
                      <div className="alert-type">
                        <span className="alert-pulse"></span>
                        {alert.type}
                      </div>

                      <span
                        className={`alert-priority ${alert.priority.toLowerCase()}`}
                      >
                        {alert.priority}
                      </span>
                    </div>

                    <div className="alert-body">
                      <div className="alert-bell">
                        <FiBell />
                      </div>

                      <div className="alert-content">
                        <h4>{alert.title}</h4>

                        <p>
                          {alert.message}
                        </p>

                        <div className="alert-meta">
                          <span>
                            <FiUsers />
                            {alert.audience}
                          </span>

                          <span>
                            <FiMapPin />
                            {alert.zone}
                          </span>
                        </div>

                        <div className="alert-action">
                          <strong>
                            Recommended:
                          </strong>{" "}
                          {alert.action}
                        </div>
                      </div>
                    </div>

                    <div className="alert-footer">
                      <span>
                        <FiRadio />
                        AI-generated preventive
                        communication
                      </span>

                      <button
                        className={
                          sent
                            ? "alert-sent"
                            : "alert-send"
                        }
                        onClick={() =>
                          sendAlert(alert.id)
                        }
                      >
                        {sent ? (
                          <>
                            <FiCheckCircle />
                            SIMULATED SENT
                          </>
                        ) : (
                          <>
                            <FiSend />
                            SEND ALERT
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="simulation-note">
            <FiAlertTriangle />
            Alerts are simulated for the prototype. No
            real notifications are sent.
          </div>
        </section>

        

        {/* MAP */}
        <section
          id="map"
          className="section-block"
        >
          <SectionHeading
            eyebrow="SPATIAL INTELLIGENCE"
            title="Vijayawada Risk Map"
            description="Explore predicted risk across major city zones."
          />

          <div className="map-wrapper">
            <div className="map-overlay-top">
              <div className="map-live">
                <span></span>
                LIVE CITY MAP
              </div>

              <div className="map-weather">
                <FiCloudRain />

                {weatherLoading
                  ? "Loading weather..."
                  : liveWeather
                  ? `${Math.round(
                      liveWeather.temperature
                    )}°C · ${Math.round(
                      liveWeather.humidity
                    )}% humidity`
                  : "Weather unavailable"}
              </div>
            </div>

            <MapContainer
              center={[16.5062, 80.648]}
              zoom={13}
              scrollWheelZoom={true}
              className="leaflet-map"
            >
              <MapResize />

              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {vijayawadaZones.map(
                (zone) => {
                  const risks =
                    getZoneRisk(zone);

                  const value =
                    mode === "heat"
                      ? risks.heat
                      : mode === "flood"
                      ? risks.flood
                      : risks.overall;

                  return (
                    <CircleMarker
                      key={zone.name}
                      center={[
                        zone.lat,
                        zone.lng,
                      ]}
                      radius={
                        selectedZone?.name ===
                        zone.name
                          ? 17
                          : 11
                      }
                      pathOptions={{
                        color:
                          getRiskColor(value),
                        fillColor:
                          getRiskColor(value),
                        fillOpacity:
                          selectedZone?.name ===
                          zone.name
                            ? 0.75
                            : 0.55,
                        weight:
                          selectedZone?.name ===
                          zone.name
                            ? 4
                            : 2,
                      }}
                      eventHandlers={{
                        click: () =>
                          setSelectedZone(zone),
                      }}
                    >

                      <Popup>
                        <strong>
                          {zone.name}
                        </strong>
                        <br />
                        Overall Risk:{" "}
                        {Math.min(
                          100,
                          risks.overall +
                            getZoneCitizenImpact(zone.name).impact
                        )}
                        <br />
                        Heat: {risks.heat}
                        <br />
                        Flood: {risks.flood}
                        <br />
                        <strong>Citizen Intelligence</strong>
                        <br />
                        Reports:{" "}
                        {getZoneCitizenImpact(zone.name).reportCount}
                        <br />
                        AI Impact: +{getZoneCitizenImpact(zone.name).impact}
                      </Popup>
                    </CircleMarker>
                  );
                }
              )}
            </MapContainer>

            <div className="map-legend">
              <span>RISK LEVEL</span>

              <div>
                <i className="low"></i>
                Low
              </div>

              <div>
                <i className="medium"></i>
                Medium
              </div>

              <div>
                <i className="high"></i>
                High
              </div>

              <div>
                <i className="critical"></i>
                Critical
              </div>
            </div>
          </div>

          {selectedZone && (
            <div className="selected-zone">
              <div className="selected-zone-icon">
                <FiMapPin />
              </div>

              <div>
                <span>SELECTED ZONE</span>
                <h4>{selectedZone.name}</h4>
              </div>

              <div className="selected-metric">
                <span>OVERALL</span>
                <strong>
                  {getZoneRisk(
                    selectedZone
                  ).overall}
                </strong>
              </div>

              <div className="selected-metric">
                <span>HEAT</span>
                <strong>
                  {getZoneRisk(
                    selectedZone
                  ).heat}
                </strong>
              </div>

              <div className="selected-metric">
                <span>FLOOD</span>
                <strong>
                  {getZoneRisk(
                    selectedZone
                  ).flood}
                </strong>
              </div>


              <button
                onClick={() =>
                  setSelectedZone(null)
                }
              >
                Close
              </button>
            </div>
          )}
        </section>

        {/* =================================================
    BEFORE VS WHAT-IF
================================================= */}

{baselineSnapshot && (
  <div className="whatif-comparison">

    <div className="whatif-header">
      <div>
        <span className="section-label">
          AI DIGITAL TWIN ANALYSIS
        </span>

        <h3>
          Before vs What-If
        </h3>
      </div>

      <div
        className={`whatif-delta ${
          whatIfComparison.overallDelta > 0
            ? "increase"
            : whatIfComparison.overallDelta < 0
            ? "decrease"
            : ""
        }`}
      >
        {whatIfComparison.overallDelta > 0
          ? "+"
          : ""}
        {whatIfComparison.overallDelta} RISK
      </div>
    </div>


    <div className="whatif-grid">

      {/* OVERALL */}

      <div className="whatif-card">

        <span>OVERALL RISK</span>

        <div className="whatif-values">

          <div>
            <small>BEFORE</small>
            <strong>
              {baselineSnapshot.overall}
            </strong>
          </div>

          <FiArrowUpRight />

          <div>
            <small>WHAT-IF</small>
            <strong>
              {overallRisk}
            </strong>
          </div>

        </div>

      </div>


      {/* HEAT */}

      <div className="whatif-card">

        <span>HEAT</span>

        <div className="whatif-values">

          <div>
            <small>BEFORE</small>
            <strong>
              {baselineSnapshot.heat}
            </strong>
          </div>

          <FiArrowUpRight />

          <div>
            <small>WHAT-IF</small>
            <strong>
              {heatRisk}
            </strong>
          </div>

        </div>

      </div>


      {/* FLOOD */}

      <div className="whatif-card">

        <span>FLOOD</span>

        <div className="whatif-values">

          <div>
            <small>BEFORE</small>
            <strong>
              {baselineSnapshot.flood}
            </strong>
          </div>

          <FiArrowUpRight />

          <div>
            <small>WHAT-IF</small>
            <strong>
              {floodRisk}
            </strong>
          </div>

        </div>

      </div>



    </div>


    <p className="whatif-insight">
      {whatIfComparison.overallDelta > 0
        ? `AI predicts overall civic risk could increase by ${whatIfComparison.overallDelta} points under this scenario.`
        : whatIfComparison.overallDelta < 0
        ? `AI predicts overall civic risk could decrease by ${Math.abs(
            whatIfComparison.overallDelta
          )} points under this scenario.`
        : "AI predicts minimal change in overall civic risk under this scenario."}
    </p>

  </div>
)}


     {/* CITIZEN REPORTS */}
<section id="citizen-reports" className="section-card citizen-reports-section">

  <div className="section-header">
    <div>
      <div className="section-kicker">
        <FiMessageSquare />
        COMMUNITY INTELLIGENCE
      </div>

      <h2>Citizen Reporting System</h2>

      <p>
        Report civic issues and help VijayaTwin AI understand
        what is happening on the ground.
      </p>
    </div>

    <div className="citizen-report-count">
      <FiUsers />
      <span>{citizenReports.length} Reports</span>
    </div>
  </div>

  <div className="citizen-report-layout">

    {/* REPORT FORM */}
    <div className="citizen-report-form">

      <h3>
        <FiMessageSquare />
        Submit a Civic Report
      </h3>

      <form onSubmit={submitCitizenReport}>

        <div className="form-group">
          <label>Issue Type</label>

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="Waterlogging">Waterlogging</option>
            <option value="Blocked Drain">Blocked Drain</option>
            <option value="Heat">Extreme Heat</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        <div className="form-group">
          <label>Location</label>

          <select
            value={reportLocation}
            onChange={(e) => setReportLocation(e.target.value)}
          >
            <option value="Benz Circle">Benz Circle</option>
            <option value="PNBS">PNBS</option>
            <option value="Eluru Road">Eluru Road</option>
            <option value="Bandar Road">Bandar Road</option>
            <option value="Gunadala">Gunadala</option>
            <option value="Moghalrajpuram">Moghalrajpuram</option>
            <option value="Labbipet">Labbipet</option>
            <option value="One Town">One Town</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>

          <textarea
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            placeholder="Describe the civic issue..."
            rows="4"
            required
          />
        </div>

        <button type="submit" className="citizen-submit-btn">
          <FiSend />
          Submit Report
        </button>

        {reportSubmitted && (
          <div className="report-success">
            <FiCheckCircle />
            Report submitted successfully
          </div>
        )}

      </form>
    </div>

    {/* RECENT REPORTS */}
    <div className="citizen-report-list">

      <div className="report-list-header">

        <div>
          <span className="section-kicker">
            <FiRadio />
            LIVE COMMUNITY FEED
          </span>

          <h3>Recent Reports</h3>
        </div>

        <span className="live-indicator">
          <span></span>
          LIVE
        </span>

      </div>

      <div className="reports-scroll">

        {citizenReports.map((report) => (
          <div
            className="citizen-report-item"
            key={report.id}
          >

            <div className="report-icon">
              {report.type === "Emergency" ? (
                <FiAlertTriangle />
              ) : report.type === "Waterlogging" ? (
                <FiDroplet />
              ) : report.type === "Blocked Drain" ? (
                <FiCloudRain />
              ) : (
                <FiThermometer />
              )}
            </div>

            <div className="report-content">

              <div className="report-top-row">
                <h4>{report.type}</h4>

                <span
                  className={`priority-badge ${report.priority
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {report.priority}
                </span>
              </div>

              <div className="report-location">
                <FiMapPin />
                {report.location}
              </div>

              <p>{report.description}</p>

              <div className="report-bottom-row">

                <span className="report-status">
                  {report.status}
                </span>

                <span className="report-time">
                  {report.time}
                </span>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>

  </div>

</section>

        {/* DIGITAL TWIN */}
        <section
          id="digital-twin"
          className="section-block"
        >
          <SectionHeading
            eyebrow="WHAT IF?"
            title="Digital Twin Simulator"
            description="Change city conditions and instantly explore how risk may respond."
          />

          <div className="twin-layout">
            <div className="scenario-panel">
              <div className="scenario-heading">
                <div>
                  <span>SIMULATION MODE</span>
                  <h4>Choose a city scenario</h4>
                </div>

                <button
                  className="reset-button"
                  onClick={
                    resetSimulation
                  }
                >
                  <FiRotateCcw />
                  Reset
                </button>
              </div>

              <div className="scenario-grid">
                <ScenarioButton
                  active={
                    scenario === "normal"
                  }
                  title="Normal"
                  description="Current city"
                  icon={<FiActivity />}
                  onClick={() =>
                    applyScenario(
                      "normal"
                    )
                  }
                />

                <ScenarioButton
                  active={
                    scenario === "heavyRain"
                  }
                  title="Heavy Rain"
                  description="Flood pressure"
                  icon={<FiCloudRain />}
                  onClick={() =>
                    applyScenario(
                      "heavyRain"
                    )
                  }
                />

                <ScenarioButton
                  active={
                    scenario === "heatwave"
                  }
                  title="Heatwave"
                  description="Extreme heat"
                  icon={<FiThermometer />}
                  onClick={() =>
                    applyScenario(
                      "heatwave"
                    )
                  }
                />


                <ScenarioButton
                  active={
                    scenario === "greenCity"
                  }
                  title="Green City"
                  description="More vegetation"
                  icon={<FiShield />}
                  onClick={() =>
                    applyScenario(
                      "greenCity"
                    )
                  }
                />
              </div>

              <div className="slider-group">
                <Slider
                  label="Temperature"
                  value={temperature}
                  min={20}
                  max={50}
                  unit="°C"
                  icon={<FiThermometer />}
                  onChange={(value) => {
                    setTemperature(value);
                    setScenario("custom");
                    setDataMode(
                      "simulation"
                    );
                  }}
                />

                <Slider
                  label="Rainfall Pressure"
                  value={rainfall}
                  min={0}
                  max={100}
                  unit="%"
                  icon={<FiCloudRain />}
                  onChange={(value) => {
                    setRainfall(value);
                    setScenario("custom");
                    setDataMode(
                      "simulation"
                    );
                  }}
                />


                <Slider
                  label="Drain Capacity"
                  value={drainCapacity}
                  min={0}
                  max={100}
                  unit="%"
                  icon={<FiDroplet />}
                  onChange={(value) => {
                    setDrainCapacity(
                      value
                    );
                    setScenario("custom");
                    setDataMode(
                      "simulation"
                    );
                  }}
                />

                <Slider
                  label="Tree Cover"
                  value={treeCover}
                  min={0}
                  max={100}
                  unit="%"
                  icon={<FiShield />}
                  onChange={(value) => {
                    setTreeCover(value);
                    setScenario("custom");
                    setDataMode(
                      "simulation"
                    );
                  }}
                />
              </div>
            </div>

            <div className="twin-result">
              <div className="twin-result-header">
                <div>
                  <span>SIMULATED CITY STATE</span>
                  <h4>
                    {scenario === "custom"
                      ? "Custom Scenario"
                      : scenario ===
                        "normal"
                      ? "Current Conditions"
                      : scenario ===
                        "heavyRain"
                      ? "Heavy Rain Scenario"
                      : scenario ===
                        "heatwave"
                      ? "Heatwave Scenario"
                      : "Green City Scenario"}
                  </h4>
                </div>

                <div className="scenario-status">
                  <span></span>
                  SIMULATED
                </div>
              </div>

              <div className="twin-score">
                <div className="score-ring">
                  <div>
                    <strong>
                      {overallRisk}
                    </strong>
                    <span>RISK</span>
                  </div>
                </div>

                <div>
                  <span className="score-label">
                    CITY CONDITION
                  </span>

                  <h3
                    style={{
                      color:
                        getRiskColor(
                          overallRisk
                        ),
                    }}
                  >
                    {getRiskLevel(
                      overallRisk
                    )}
                  </h3>

                  <p>
                    The digital twin estimates
                    current combined pressure
                    across heat and flood
                    signals.
                  </p>
                </div>
              </div>

              <div className="twin-metrics">
                <TwinMetric
                  label="Heat"
                  value={heatRisk}
                  icon={<FiThermometer />}
                />

                <TwinMetric
                  label="Flood"
                  value={floodRisk}
                  icon={<FiDroplet />}
                />

              </div>

              <div className="twin-footer">
                <FiEye />
                Simulation values are illustrative
                and intended for prototype demonstration.
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
               <footer className="footer">
          ...
        </footer>

        {/* VIJAYA AI CHATBOT */}
        <Chatbot
          heatRisk={heatRisk}
          floodRisk={floodRisk}
          overallRisk={overallRisk}
          citizenReports={citizenReports}
          selectedZone={selectedZone}
          applyScenario={applyScenario}
          setMode={setMode}
        />
      </main>
    </div>
  );
}

/* COMPONENTS */

function RiskCard({
  icon,
  label,
  value,
  level,
  color,
  meta,
  active,
  onClick,
  featured,
}) {
  return (
    <button
      className={`risk-card ${
        active ? "selected" : ""
      } ${featured ? "featured" : ""}`}
      onClick={onClick}
      style={{
        "--risk-color": color,
      }}
    >
      <div className="risk-card-top">
        <div className="risk-icon">
          {icon}
        </div>

        <span>{label}</span>

        <FiArrowUpRight className="risk-arrow" />
      </div>

      <div className="risk-number">
        {value}
        <small>/100</small>
      </div>

      <div className="risk-bottom">
        <strong>{level}</strong>
        <span>{meta}</span>
      </div>

      <div className="risk-progress">
        <i
          style={{
            width: `${value}%`,
            background: color,
          }}
        ></i>
      </div>
    </button>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="section-heading">
      <div>
        <span>{eyebrow}</span>
        <h3>{title}</h3>
      </div>

      <p>{description}</p>
    </div>
  );
}

function Legend({ label, value }) {
  return (
    <div className="legend-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TrendLine({
  data,
  keyName,
  stroke,
  width,
}) {
  const points = data
    .map((item, index) => {
      const x =
        (index / (data.length - 1)) * 1000;
      const y =
        280 - (item[keyName] / 100) * 250;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <polyline
      points={points}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function ScenarioButton({
  active,
  title,
  description,
  icon,
  onClick,
}) {
  return (
    <button
      className={`scenario-button ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      <div className="scenario-icon">
        {icon}
      </div>

      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      {active && (
        <FiCheckCircle className="scenario-check" />
      )}
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  unit,
  icon,
  onChange,
}) {
  return (
    <div className="slider-row">
      <div className="slider-label">
        <div>
          {icon}
          <span>{label}</span>
        </div>

        <strong>
          {value}
          {unit}
        </strong>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
        style={{
          "--range-progress": `${
            ((value - min) /
              (max - min)) *
            100
          }%`,
        }}
      />
    </div>
  );
}

function TwinMetric({
  label,
  value,
  icon,
}) {
  return (
    <div className="twin-metric">
      <div>
        {icon}
        <span>{label}</span>
      </div>

      <strong>{value}</strong>

      <div className="metric-line">
        <i
          style={{
            width: `${value}%`,
          }}
        ></i>
      </div>
    </div>
  );
}

export default App;