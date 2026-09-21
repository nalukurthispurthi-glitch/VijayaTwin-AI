import { useState } from "react";
import {
  FiAlertTriangle,
  FiChevronDown,
  FiDroplet,
  FiMap,
  FiMessageCircle,
  FiSend,
  FiThermometer,
  FiX,
  FiZap,
} from "react-icons/fi";
import "./Chatbot.css";

const quickActions = [
  {
    label: "Flood Risk",
    icon: <FiDroplet />,
    text: "What is the current flood risk?",
  },
  {
    label: "Heat Risk",
    icon: <FiThermometer />,
    text: "What is the current heat risk?",
  },
  {
    label: "What If?",
    icon: <FiZap />,
    text: "What if heavy rain occurs?",
  },
  {
    label: "Risk Zones",
    icon: <FiMap />,
    text: "Which zones need attention?",
  },
  {
    label: "Prevention",
    icon: <FiAlertTriangle />,
    text: "What preventive actions are recommended?",
  },
];

function getRiskLevel(value) {
  if (value >= 81) return "Critical";
  if (value >= 61) return "High";
  if (value >= 31) return "Medium";
  return "Low";
}

export default function Chatbot({
  heatRisk,
  floodRisk,
  overallRisk,
  citizenReports,
  selectedZone,
  applyScenario,
  setMode,
}) {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text:
        "👋 Hello! I'm Vijaya AI, your Civic Intelligence Assistant. Ask me about Vijayawada's risks, citizen reports, or What-If scenarios.",
    },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = (question) => {
    if (!question.trim()) return;

    const lower = question.toLowerCase();

    let response =
      "I can help you with flood risk, heat risk, risk zones, citizen reports, prevention actions, and Digital Twin scenarios.";

    /* FLOOD */
    if (
      lower.includes("flood") ||
      lower.includes("waterlogging")
    ) {
      response = `🌧️ Current Flood Risk: ${Math.round(
        floodRisk
      )}/100 — ${getRiskLevel(floodRisk)}.

The prototype calculates flood risk using rainfall pressure and drainage capacity.`;

      setMode("flood");
    }

    /* HEAT */
    else if (
      lower.includes("heat") ||
      lower.includes("temperature")
    ) {
      response = `🌡️ Current Heat Risk: ${Math.round(
        heatRisk
      )}/100 — ${getRiskLevel(heatRisk)}.

The prototype considers temperature and tree-cover conditions.`;

      setMode("heat");
    }

    /* OVERALL */
    else if (
      lower.includes("overall") ||
      lower.includes("civic") ||
      lower.includes("current risk")
    ) {
      response = `🏙️ Current Civic Risk: ${Math.round(
        overallRisk
      )}/100 — ${getRiskLevel(overallRisk)}.

VijayaTwin combines heat and flood risk signals into an overall civic risk.`;

      setMode("overall");
    }

    /* WHAT IF */
    else if (
      lower.includes("what if") ||
      lower.includes("simulate") ||
      lower.includes("heavy rain")
    ) {
      response =
        "🔮 Running the Heavy Rain scenario in the Digital Twin...\n\nRainfall pressure increases and drainage capacity decreases so you can observe how flood risk changes.";

      applyScenario("heavyRain");
    }

    /* ZONES */
    else if (
      lower.includes("zone") ||
      lower.includes("area") ||
      lower.includes("attention")
    ) {
      const zoneName =
        selectedZone?.name || "the selected Vijayawada zone";

      response = `🗺️ The Risk Map can be used to inspect Vijayawada zones individually.

Currently selected: ${zoneName}.

I have switched the map to Overall Risk mode.`;

      setMode("overall");
    }

    /* CITIZEN REPORTS */
    else if (
      lower.includes("citizen") ||
      lower.includes("report")
    ) {
      const reports = Array.isArray(citizenReports)
        ? citizenReports.filter(
            (report) => report.status !== "RESOLVED"
          )
        : [];

      response = `👥 Citizen Intelligence

There are currently ${
        reports.length
      } unresolved citizen report${
        reports.length === 1 ? "" : "s"
      }.

Citizen reports provide ground-level intelligence that can support the city's risk picture.`;
    }

    /* PREVENTION */
    else if (
      lower.includes("prevent") ||
      lower.includes("recommend") ||
      lower.includes("action")
    ) {
      response =
        "🛡️ Recommended preventive actions:\n\n• Monitor high-risk zones\n• Inspect vulnerable drainage points\n• Provide heat-protection guidance\n• Monitor citizen reports\n• Use Digital Twin What-If scenarios for planning";
    }

    /* HELLO */
    else if (
      lower.includes("hello") ||
      lower.includes("hi")
    ) {
      response =
        "👋 Hi! I'm Vijaya AI. Ask me about flood risk, heat risk, citizen reports, or run a What-If scenario.";
    }

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        sender: "user",
        text: question,
      },
      {
        id: Date.now() + 1,
        sender: "bot",
        text: response,
      },
    ]);

    setInput("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        className={`vijaya-ai-button ${
          open ? "active" : ""
        }`}
        onClick={() => setOpen(!open)}
        aria-label="Open Vijaya AI"
      >
        {open ? <FiX /> : <FiMessageCircle />}

        {!open && (
          <span className="vijaya-ai-online"></span>
        )}
      </button>

      {/* CHAT WINDOW */}
      {open && (
        <div className="vijaya-ai-container">

          {/* HEADER */}
          <div className="vijaya-ai-header">

            <div className="vijaya-ai-logo">
              <FiZap />
            </div>

            <div className="vijaya-ai-title">
              <h3>Vijaya AI</h3>
              <span>
                Civic Intelligence Assistant
              </span>
            </div>

            <button
              className="vijaya-ai-minimize"
              onClick={() => setOpen(false)}
            >
              <FiChevronDown />
            </button>

          </div>

          {/* STATUS */}
          <div className="vijaya-ai-status">
            <span></span>
            Connected to VijayaTwin dashboard
          </div>

          {/* MESSAGES */}
          <div className="vijaya-ai-messages">

            {messages.map((message) => (
              <div
                key={message.id}
                className={`vijaya-ai-message ${message.sender}`}
              >
                <div className="vijaya-ai-bubble">
                  {message.text
                    .split("\n")
                    .map((line, index) => (
                      <span key={index}>
                        {line}
                        <br />
                      </span>
                    ))}
                </div>
              </div>
            ))}

          </div>

          {/* QUICK ACTIONS */}
          <div className="vijaya-ai-quick">

            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() =>
                  sendMessage(action.text)
                }
              >
                {action.icon}
                {action.label}
              </button>
            ))}

          </div>

          {/* INPUT */}
          <form
            className="vijaya-ai-input"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              placeholder="Ask Vijaya AI..."
            />

            <button type="submit">
              <FiSend />
            </button>
          </form>

        </div>
      )}
    </>
  );
}