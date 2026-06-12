// Loader for openfootball/worldcup.json (CC0, served via jsDelivr CDN with CORS).
// Provides full WC2026 fixtures with explicit group letters — used as the
// primary schedule source. ESPN is used only to overlay live scores/state.
//
// Source format example:
//   { round: "Matchday 1", date: "2026-06-11", time: "13:00 UTC-6",
//     team1: "Mexico", team2: "South Africa",
//     group: "Group A", ground: "Mexico City" }

const OPENFOOTBALL_URL =
  "https://cdn.jsdelivr.net/gh/openfootball/worldcup.json@master/2026/worldcup.json";

async function fetchOpenfootballMatches() {
  try {
    const res = await fetch(OPENFOOTBALL_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.matches || []).map(parseOpenfootballMatch);
  } catch (err) {
    console.warn("openfootball fetch failed:", err);
    return [];
  }
}

function parseOpenfootballMatch(m) {
  const date = parseOpenfootballDate(m.date, m.time);
  const isGroup = m.group && m.group.startsWith("Group ");
  const groupLetter = isGroup ? m.group.slice(6).trim() : null;

  let stage = "group-stage";
  if (!isGroup) {
    const r = (m.round || "").toLowerCase();
    if (r.includes("round of 32") || r.includes("round 32")) stage = "round-of-32";
    else if (r.includes("round of 16") || r.includes("round 16")) stage = "round-of-16";
    else if (r.includes("quarter")) stage = "quarterfinals";
    else if (r.includes("semi")) stage = "semifinals";
    else if (r.includes("third") || r.includes("3rd")) stage = "third-place";
    else if (r.includes("final")) stage = "final";
  }

  const id = `of-${m.date}-${slug(m.team1)}-${slug(m.team2)}`;

  return {
    id,
    date,
    state: "pre",
    completed: false,
    statusDetail: "",
    statusName: "",
    clock: "",
    period: 0,
    stage,
    venue: m.ground || "",
    venueCity: "",
    group: groupLetter,
    home: { id: null, name: m.team1, abbr: "", logo: "", score: null, winner: false },
    away: { id: null, name: m.team2, abbr: "", logo: "", score: null, winner: false }
  };
}

function parseOpenfootballDate(dateStr, timeStr) {
  // dateStr: "2026-06-11", timeStr: "13:00 UTC-6"
  const [y, mo, d] = dateStr.split("-").map(Number);
  const tMatch = (timeStr || "").match(/^(\d{1,2}):(\d{2})\s+UTC([+-]\d{1,2})?/);
  if (!tMatch) return new Date(Date.UTC(y, mo - 1, d, 12, 0));
  const hh = Number(tMatch[1]);
  const mm = Number(tMatch[2]);
  const offset = tMatch[3] ? Number(tMatch[3]) : 0;
  // Local time at venue → convert to UTC by subtracting offset
  return new Date(Date.UTC(y, mo - 1, d, hh - offset, mm));
}

function slug(s) {
  return String(s).toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
