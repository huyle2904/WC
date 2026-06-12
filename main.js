// ============================================================
// World Cup 2026 — App
// Data: ESPN public API + fallback
// ============================================================

const API_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
const TOURNAMENT_START = "2026-06-11";
const TOURNAMENT_END   = "2026-07-19";
const REFRESH_INTERVAL = 60_000; // 60s while tab visible

const state = {
  matches: [],          // normalized matches
  view: "schedule",     // groups | knockout | schedule | standings
  filterLive: false,
  filterUpcoming: false,
  search: "",
  loading: true,
  error: null,
  lastFetch: null
};

// ============================================================
// API
// ============================================================

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function* dateRange(start, end) {
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    yield new Date(cur);
    cur.setDate(cur.getDate() + 1);
  }
}

async function fetchDay(dateStr) {
  const url = `${API_BASE}?dates=${dateStr}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Failed to fetch ${dateStr}:`, err);
    return null;
  }
}

async function fetchAllMatches() {
  const start = new Date(TOURNAMENT_START);
  const end   = new Date(TOURNAMENT_END);
  const dates = [...dateRange(start, end)].map(ymd);

  // Fetch in chunks of 7 to avoid hammering
  const all = [];
  for (let i = 0; i < dates.length; i += 7) {
    const chunk = dates.slice(i, i + 7);
    const results = await Promise.all(chunk.map(fetchDay));
    for (const data of results) {
      if (data?.events) all.push(...data.events);
    }
  }

  // Dedupe by id
  const seen = new Set();
  const unique = [];
  for (const ev of all) {
    if (!seen.has(ev.id)) {
      seen.add(ev.id);
      unique.push(ev);
    }
  }
  return unique;
}

// ============================================================
// Normalize
// ============================================================

function normalizeMatch(ev) {
  const comp = ev.competitions?.[0];
  if (!comp) return null;

  const home = comp.competitors?.find(c => c.homeAway === "home");
  const away = comp.competitors?.find(c => c.homeAway === "away");
  if (!home || !away) return null;

  const status = comp.status?.type || {};
  const stateRaw = status.state || "pre"; // pre | in | post

  return {
    id: ev.id,
    date: new Date(comp.date || ev.date),
    state: stateRaw,
    completed: status.completed === true,
    statusDetail: status.shortDetail || status.detail || "",
    statusName: status.name || "",
    clock: comp.status?.displayClock || "",
    period: comp.status?.period || 0,
    stage: ev.season?.slug || "group-stage",
    venue: comp.venue?.fullName || "",
    venueCity: comp.venue?.address?.city || "",
    home: {
      id: home.team?.id,
      name: home.team?.displayName || home.team?.name || "?",
      abbr: home.team?.abbreviation || "",
      logo: home.team?.logo || "",
      score: home.score != null ? Number(home.score) : null,
      winner: home.winner === true
    },
    away: {
      id: away.team?.id,
      name: away.team?.displayName || away.team?.name || "?",
      abbr: away.team?.abbreviation || "",
      logo: away.team?.logo || "",
      score: away.score != null ? Number(away.score) : null,
      winner: away.winner === true
    }
  };
}

// ============================================================
// Group inference
// ============================================================
// ESPN API doesn't expose group letter directly. Infer from team
// participation: 6 matches per group, between same 4 teams during
// group stage (before 2026-06-28).

function inferGroups(matches) {
  // Prefer explicit group letter from openfootball when available
  const explicit = {};
  let hasExplicit = false;
  for (const m of matches) {
    if (m.stage !== "group-stage" || !m.group) continue;
    hasExplicit = true;
    if (!explicit[m.group]) explicit[m.group] = new Set();
    explicit[m.group].add(m.home.name);
    explicit[m.group].add(m.away.name);
  }
  if (hasExplicit) {
    const result = {};
    Object.keys(explicit).sort().forEach(letter => {
      result[letter] = [...explicit[letter]].sort();
    });
    return result;
  }

  // Fallback: infer from connectivity (when only ESPN data is present)
  const GROUP_END = new Date("2026-06-28T00:00:00Z");
  const groupMatches = matches.filter(m =>
    m.stage === "group-stage" && m.date < GROUP_END
  );

  // Build adjacency: team -> set of opponents in group stage
  const adj = new Map();
  for (const m of groupMatches) {
    const a = m.home.name, b = m.away.name;
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a).add(b);
    adj.get(b).add(a);
  }

  // Connected components of size 4
  const visited = new Set();
  const groups = [];
  for (const team of adj.keys()) {
    if (visited.has(team)) continue;
    const comp = new Set([team]);
    const queue = [team];
    visited.add(team);
    while (queue.length) {
      const t = queue.shift();
      for (const opp of adj.get(t) || []) {
        if (!visited.has(opp)) {
          visited.add(opp);
          comp.add(opp);
          queue.push(opp);
        }
      }
    }
    if (comp.size === 4) groups.push([...comp]);
  }

  // Sort groups by alphabet of first team for stability, then label A..L
  groups.sort((g1, g2) => g1[0].localeCompare(g2[0]));
  const map = {};
  groups.forEach((teams, i) => {
    const letter = String.fromCharCode(65 + i);
    map[letter] = teams.sort();
  });
  return map;
}

function computeStandings(teams, matches) {
  const init = (n) => ({
    name: n, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, Pts: 0, logo: ""
  });
  const tbl = {};
  for (const t of teams) tbl[t] = init(t);

  for (const m of matches) {
    if (!m.completed) continue;
    if (!tbl[m.home.name] || !tbl[m.away.name]) continue;
    const H = tbl[m.home.name], A = tbl[m.away.name];
    H.logo = H.logo || m.home.logo;
    A.logo = A.logo || m.away.logo;
    H.P++; A.P++;
    H.GF += m.home.score; H.GA += m.away.score;
    A.GF += m.away.score; A.GA += m.home.score;
    if (m.home.score > m.away.score) {
      H.W++; A.L++; H.Pts += 3;
    } else if (m.home.score < m.away.score) {
      A.W++; H.L++; A.Pts += 3;
    } else {
      H.D++; A.D++; H.Pts++; A.Pts++;
    }
  }

  return Object.values(tbl).sort((a, b) => {
    if (b.Pts !== a.Pts) return b.Pts - a.Pts;
    const gdA = a.GF - a.GA, gdB = b.GF - b.GA;
    if (gdB !== gdA) return gdB - gdA;
    if (b.GF !== a.GF) return b.GF - a.GF;
    return a.name.localeCompare(b.name);
  });
}

// ============================================================
// Format helpers
// ============================================================

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const VI_DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const VI_MONTHS = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
                   "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];

function formatDay(d) {
  return `${VI_DAYS[d.getDay()]}, ${d.getDate()} ${VI_MONTHS[d.getMonth()]}`;
}

function formatTime(d) {
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit", minute: "2-digit", hour12: false
  });
}

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function stageLabel(slug) {
  const map = {
    "group-stage": "Vòng bảng",
    "round-of-32": "Vòng 1/16",
    "round-of-16": "Vòng 1/8",
    "quarterfinals": "Tứ kết",
    "semifinals": "Bán kết",
    "third-place": "Tranh 3-4",
    "final": "Chung kết"
  };
  return map[slug] || slug;
}

function statusText(m) {
  if (m.state === "in") {
    return m.clock ? `LIVE · ${m.clock}` : "LIVE";
  }
  if (m.state === "post") return "Kết thúc";
  return formatTime(m.date);
}

// ============================================================
// Match card rendering
// ============================================================

function renderMatchCard(m) {
  const tpl = document.getElementById("matchCardTpl");
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.matchId = m.id;
  node.classList.add(`is-${m.state}`);

  node.querySelector(".match-stage").textContent = stageLabel(m.stage);
  node.querySelector(".match-date").textContent = formatDay(m.date);

  const homeEl = node.querySelector(".team-home");
  const awayEl = node.querySelector(".team-away");
  homeEl.querySelector(".team-name").textContent = m.home.name;
  awayEl.querySelector(".team-name").textContent = m.away.name;
  if (m.home.logo) homeEl.querySelector(".team-logo").src = m.home.logo;
  if (m.away.logo) awayEl.querySelector(".team-logo").src = m.away.logo;

  if (m.state !== "pre" && m.home.score != null) {
    node.querySelector(".score-home").textContent = m.home.score;
    node.querySelector(".score-away").textContent = m.away.score;
    node.querySelector(".score-sep").textContent = "-";
  } else {
    node.querySelector(".score-home").textContent = "";
    node.querySelector(".score-away").textContent = "";
    node.querySelector(".score-sep").textContent = formatTime(m.date);
  }

  if (m.state === "post") {
    if (m.home.score > m.away.score) {
      homeEl.classList.add("is-winner");
      awayEl.classList.add("is-loser");
    } else if (m.away.score > m.home.score) {
      awayEl.classList.add("is-winner");
      homeEl.classList.add("is-loser");
    }
  }

  node.querySelector(".match-status").textContent = statusText(m);
  const venueText = m.venue
    ? (m.venueCity ? `${m.venue} · ${m.venueCity}` : m.venue)
    : "";
  node.querySelector(".match-venue").textContent = venueText;

  node.addEventListener("click", () => {
    try {
      openMatchDetail(m.id);
    } catch (err) {
      console.error("Lỗi mở chi tiết trận:", err);
      alert("Lỗi: " + err.message);
    }
  });

  return node;
}


// ============================================================
// Views
// ============================================================

function renderGroupsView(container) {
  const groups = inferGroups(state.matches);
  const letters = Object.keys(groups).sort();

  if (letters.length === 0) {
    container.innerHTML = `<div class="empty">Chưa có dữ liệu vòng bảng. Thử "Lịch theo ngày" hoặc bấm tải lại.</div>`;
    return;
  }

  const grid = document.createElement("div");
  grid.className = "groups-grid";

  for (const letter of letters) {
    const teams = groups[letter];
    const groupMatches = state.matches.filter(m =>
      m.stage === "group-stage" &&
      teams.includes(m.home.name) &&
      teams.includes(m.away.name)
    ).sort((a, b) => a.date - b.date);

    if (!matchesPassFilter(groupMatches)) continue;

    const card = document.getElementById("groupCardTpl")
      .content.firstElementChild.cloneNode(true);
    card.querySelector(".group-title").textContent = `Bảng ${letter}`;

    const played = groupMatches.filter(m => m.completed).length;
    card.querySelector(".group-progress").textContent = `${played}/${groupMatches.length} trận`;

    const standings = computeStandings(teams, groupMatches);
    const tbody = card.querySelector(".standings-body");
    standings.forEach((row, idx) => {
      const tr = document.createElement("tr");
      if (idx < 2) tr.className = "qualifies";
      else if (idx === 2) tr.className = "playoff";
      const gd = row.GF - row.GA;
      const gdStr = gd > 0 ? `+${gd}` : `${gd}`;
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td class="al">
          <div class="team-cell">
            ${row.logo ? `<img src="${row.logo}" alt="">` : ""}
            <span>${row.name}</span>
          </div>
        </td>
        <td>${row.P}</td>
        <td>${row.W}</td>
        <td>${row.D}</td>
        <td>${row.L}</td>
        <td>${row.GF}</td>
        <td>${row.GA}</td>
        <td>${gdStr}</td>
        <td class="points">${row.Pts}</td>
      `;
      tbody.appendChild(tr);
    });

    const matchesBox = card.querySelector(".group-matches");
    for (const m of groupMatches) {
      const mm = document.createElement("div");
      mm.className = "mini-match";
      const scoreClass = m.state === "pre" ? "mscore pre" : "mscore";
      const scoreText = m.state === "pre"
        ? `${formatDay(m.date)} ${formatTime(m.date)}`
        : `${m.home.score ?? "-"} - ${m.away.score ?? "-"}`;
      mm.innerHTML = `
        <div class="mh">
          ${m.home.logo ? `<img src="${m.home.logo}" alt="">` : ""}
          <span>${m.home.name}</span>
        </div>
        <div class="${scoreClass}">${scoreText}</div>
        <div class="ma">
          ${m.away.logo ? `<img src="${m.away.logo}" alt="">` : ""}
          <span>${m.away.name}</span>
        </div>
      `;
      matchesBox.appendChild(mm);
    }

    grid.appendChild(card);
  }

  container.innerHTML = "";
  container.appendChild(grid);
}

function renderScheduleView(container) {
  const filtered = state.matches.filter(passesFilter).sort((a, b) => a.date - b.date);
  if (!filtered.length) {
    container.innerHTML = `<div class="empty">Không có trận nào khớp bộ lọc.</div>`;
    return;
  }

  const byDay = new Map();
  for (const m of filtered) {
    const k = dayKey(m.date);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k).push(m);
  }

  container.innerHTML = "";
  for (const [k, list] of byDay) {
    const section = document.createElement("section");
    section.className = "date-section";
    const header = document.createElement("div");
    header.className = "date-header";
    const d = list[0].date;
    header.innerHTML = `
      <h3>${formatDay(d)}</h3>
      <span class="day-label">${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()}</span>
      <span class="day-count">${list.length} trận</span>
    `;
    section.appendChild(header);
    const grid = document.createElement("div");
    grid.className = "match-grid";
    for (const m of list) grid.appendChild(renderMatchCard(m));
    section.appendChild(grid);
    container.appendChild(section);
  }
}

function renderKnockoutView(container) {
  const knockout = state.matches.filter(m =>
    m.stage !== "group-stage" && passesFilter(m)
  ).sort((a, b) => a.date - b.date);

  container.innerHTML = "";

  if (!knockout.length) {
    container.innerHTML = `
      <div class="bracket-info">
        <h3>Vòng loại trực tiếp chưa bắt đầu</h3>
        <p>Bắt đầu từ 28/06/2026 (Vòng 1/16) — sẽ hiện ngay khi có lịch chính thức.</p>
      </div>`;
    return;
  }

  const stages = ["round-of-32", "round-of-16", "quarterfinals",
                  "semifinals", "third-place", "final"];
  const wrap = document.createElement("div");
  wrap.className = "bracket-rounds";
  for (const s of stages) {
    const list = knockout.filter(m => m.stage === s);
    if (!list.length) continue;
    const round = document.createElement("section");
    round.className = "bracket-round";
    round.innerHTML = `<h3>${stageLabel(s)}</h3>`;
    const grid = document.createElement("div");
    grid.className = "match-grid";
    for (const m of list) grid.appendChild(renderMatchCard(m));
    round.appendChild(grid);
    wrap.appendChild(round);
  }
  container.appendChild(wrap);
}

function renderStandingsView(container) {
  const groups = inferGroups(state.matches);
  const letters = Object.keys(groups).sort();
  if (!letters.length) {
    container.innerHTML = `<div class="empty">Chưa có dữ liệu bảng xếp hạng.</div>`;
    return;
  }
  const grid = document.createElement("div");
  grid.className = "groups-grid";
  for (const letter of letters) {
    const teams = groups[letter];
    const groupMatches = state.matches.filter(m =>
      m.stage === "group-stage" &&
      teams.includes(m.home.name) &&
      teams.includes(m.away.name)
    );
    const standings = computeStandings(teams, groupMatches);
    const card = document.createElement("section");
    card.className = "group-card";
    const played = groupMatches.filter(m => m.completed).length;
    let rows = "";
    standings.forEach((row, idx) => {
      const cls = idx < 2 ? "qualifies" : (idx === 2 ? "playoff" : "");
      const gd = row.GF - row.GA;
      const gdStr = gd > 0 ? `+${gd}` : `${gd}`;
      rows += `
        <tr class="${cls}">
          <td>${idx + 1}</td>
          <td class="al"><div class="team-cell">${row.logo ? `<img src="${row.logo}" alt="">` : ""}<span>${row.name}</span></div></td>
          <td>${row.P}</td><td>${row.W}</td><td>${row.D}</td><td>${row.L}</td>
          <td>${row.GF}</td><td>${row.GA}</td><td>${gdStr}</td>
          <td class="points">${row.Pts}</td>
        </tr>`;
    });
    card.innerHTML = `
      <div class="group-header">
        <h2 class="group-title">Bảng ${letter}</h2>
        <span class="group-progress">${played}/${groupMatches.length} trận</span>
      </div>
      <table class="standings-table">
        <thead><tr><th>#</th><th class="al">Đội</th><th>ST</th><th>T</th><th>H</th><th>B</th><th>BT</th><th>BB</th><th>HS</th><th>Đ</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    grid.appendChild(card);
  }
  container.innerHTML = "";
  container.appendChild(grid);
}

// ============================================================
// Filters
// ============================================================

function passesFilter(m) {
  if (state.filterLive && m.state !== "in") return false;
  if (state.filterUpcoming && m.state !== "pre") return false;
  if (state.search) {
    const q = state.search.toLowerCase();
    if (!m.home.name.toLowerCase().includes(q) &&
        !m.away.name.toLowerCase().includes(q)) return false;
  }
  return true;
}

function matchesPassFilter(list) {
  if (!state.filterLive && !state.filterUpcoming && !state.search) return true;
  return list.some(passesFilter);
}

// ============================================================
// Render dispatcher
// ============================================================

function render() {
  const container = document.getElementById("content");

  if (state.loading) {
    container.innerHTML = `
      <div class="state">
        <div class="spinner"></div>
        <p>Đang tải lịch thi đấu...</p>
      </div>`;
    return;
  }

  // Live indicator
  const liveCount = state.matches.filter(m => m.state === "in").length;
  const liveEl = document.getElementById("liveIndicator");
  if (liveCount > 0) {
    liveEl.classList.remove("hidden");
    document.getElementById("liveCount").textContent = liveCount;
  } else {
    liveEl.classList.add("hidden");
  }

  // Last updated
  if (state.lastFetch) {
    document.getElementById("lastUpdated").textContent =
      `Cập nhật: ${formatTime(state.lastFetch)}`;
  }

  let errBox = "";
  if (state.error) {
    errBox = `<div class="error">${state.error}</div>`;
  }
  container.innerHTML = errBox;
  const inner = document.createElement("div");
  container.appendChild(inner);

  if (!state.matches.length) {
    inner.innerHTML = `<div class="empty">Chưa có dữ liệu trận đấu. Hãy bấm tải lại.</div>`;
    return;
  }

  switch (state.view) {
    case "groups":    renderGroupsView(inner); break;
    case "knockout":  renderKnockoutView(inner); break;
    case "schedule":  renderScheduleView(inner); break;
    case "standings": renderStandingsView(inner); break;
  }
}

// ============================================================
// Init + events + auto-refresh
// ============================================================

async function loadData() {
  state.loading = state.matches.length === 0;
  state.error = null;
  render();

  const refreshBtn = document.getElementById("refreshBtn");
  refreshBtn.classList.add("spinning");

  try {
    // Fetch both sources in parallel.
    // openfootball: full WC2026 schedule with explicit group letters (A-L)
    // ESPN: live scores + match state + venue details + team logos
    const [ofMatches, espnEvents] = await Promise.all([
      fetchOpenfootballMatches(),
      fetchAllMatches()
    ]);
    const espnMatches = espnEvents.map(normalizeMatch).filter(Boolean);
    const merged = mergeSources(ofMatches, espnMatches);

    if (!merged.length) {
      state.error = "Không tải được dữ liệu lịch thi đấu. Kiểm tra kết nối mạng.";
    }
    state.matches = merged;
    state.lastFetch = new Date();
  } catch (err) {
    state.error = `Lỗi tải dữ liệu: ${err.message}`;
  } finally {
    state.loading = false;
    refreshBtn.classList.remove("spinning");
    render();
  }
}

// Merge openfootball schedule (authoritative for fixtures + groups) with
// ESPN live data (authoritative for scores + state + logos).
// Match by team-pair within ±1 day to be tolerant of timezone differences.
function mergeSources(ofMatches, espnMatches) {
  if (!ofMatches.length) return espnMatches;
  if (!espnMatches.length) return ofMatches;

  const espnByPair = new Map();
  for (const e of espnMatches) {
    const key = pairKey(e.home.name, e.away.name);
    if (!espnByPair.has(key)) espnByPair.set(key, []);
    espnByPair.get(key).push(e);
  }

  const ONE_DAY = 24 * 60 * 60 * 1000;
  return ofMatches.map(of => {
    const key = pairKey(of.home.name, of.away.name);
    const candidates = espnByPair.get(key) || [];
    const espn = candidates.find(e => Math.abs(e.date - of.date) < ONE_DAY);
    if (!espn) return of;
    return {
      ...of,
      id: espn.id,
      date: espn.date,
      state: espn.state,
      completed: espn.completed,
      statusDetail: espn.statusDetail,
      statusName: espn.statusName,
      clock: espn.clock,
      period: espn.period,
      venue: espn.venue || of.venue,
      venueCity: espn.venueCity,
      home: { ...of.home, ...espn.home, name: of.home.name },
      away: { ...of.away, ...espn.away, name: of.away.name }
    };
  });
}

function pairKey(a, b) {
  const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
  return [norm(a), norm(b)].sort().join("__");
}

function bindEvents() {
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      state.view = btn.dataset.view;
      render();
    });
  });

  document.getElementById("filterLive").addEventListener("change", (e) => {
    state.filterLive = e.target.checked;
    if (state.filterLive) {
      document.getElementById("filterUpcoming").checked = false;
      state.filterUpcoming = false;
    }
    render();
  });

  document.getElementById("filterUpcoming").addEventListener("change", (e) => {
    state.filterUpcoming = e.target.checked;
    if (state.filterUpcoming) {
      document.getElementById("filterLive").checked = false;
      state.filterLive = false;
    }
    render();
  });

  let searchTimer;
  document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = e.target.value.trim();
      render();
    }, 200);
  });

  document.getElementById("refreshBtn").addEventListener("click", loadData);
}

function startAutoRefresh() {
  setInterval(() => {
    if (document.visibilityState === "visible") {
      const hasLive = state.matches.some(m => m.state === "in");
      if (hasLive) loadData();
    }
  }, REFRESH_INTERVAL);
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  loadData();
  startAutoRefresh();
});

// ============================================================

// ============================================================
// Prediction (FIFA-points-based, Elo-style)
// ============================================================

function predictMatch(homeName, awayName, isNeutral = true) {
  const h = getFifaRanking(homeName);
  const a = getFifaRanking(awayName);
  const hPts = h ? h.points : 1500;
  const aPts = a ? a.points : 1500;

  // Home advantage (~60 Elo points). At neutral venues we still apply
  // a small bias to the nominal "home" team for visual symmetry.
  const homeAdv = isNeutral ? 30 : 80;
  const diff = (hPts + homeAdv) - aPts;

  // Logistic expected score
  const expHome = 1 / (1 + Math.pow(10, -diff / 400));

  // Convert expected score to W/D/L probabilities. Draw probability is
  // higher for evenly-matched sides; modeled as a Gaussian peaked at diff=0.
  const drawPeak = 0.28;
  const drawSpread = 200;
  const pDraw = drawPeak * Math.exp(-(diff * diff) / (2 * drawSpread * drawSpread));

  const remaining = 1 - pDraw;
  const pHome = remaining * expHome;
  const pAway = remaining * (1 - expHome);

  return {
    home: { name: homeName, points: hPts, rank: h?.rank ?? null },
    away: { name: awayName, points: aPts, rank: a?.rank ?? null },
    pHome: Math.round(pHome * 100),
    pDraw: Math.round(pDraw * 100),
    pAway: Math.round(pAway * 100),
    diff: Math.round(diff)
  };
}

// ============================================================
// Head-to-head (computed from current tournament data only)
// ============================================================

function getHeadToHead(homeName, awayName) {
  const h2h = state.matches.filter(m => {
    if (!m.completed) return false;
    return (m.home.name === homeName && m.away.name === awayName) ||
           (m.home.name === awayName && m.away.name === homeName);
  }).sort((a, b) => b.date - a.date);

  let wHome = 0, wAway = 0, draws = 0;
  let gfHome = 0, gfAway = 0;
  for (const m of h2h) {
    const isHomeTheHome = m.home.name === homeName;
    const sH = isHomeTheHome ? m.home.score : m.away.score;
    const sA = isHomeTheHome ? m.away.score : m.home.score;
    gfHome += sH; gfAway += sA;
    if (sH > sA) wHome++;
    else if (sA > sH) wAway++;
    else draws++;
  }

  return { matches: h2h, wHome, wAway, draws, gfHome, gfAway };
}

// ============================================================
// Match detail page
// ============================================================

function openMatchDetail(matchId) {
  const m = state.matches.find(x => x.id === matchId);
  if (!m) return;
  state.detailMatchId = matchId;

  const overlay = document.createElement("div");
  overlay.className = "detail-overlay";
  overlay.id = "detailOverlay";
  overlay.innerHTML = renderMatchDetail(m);
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  overlay.querySelector(".detail-back").addEventListener("click", closeMatchDetail);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeMatchDetail();
  });
  document.addEventListener("keydown", escCloseHandler);
}

function closeMatchDetail() {
  const overlay = document.getElementById("detailOverlay");
  if (overlay) overlay.remove();
  document.body.style.overflow = "";
  document.removeEventListener("keydown", escCloseHandler);
  state.detailMatchId = null;
}

function escCloseHandler(e) {
  if (e.key === "Escape") closeMatchDetail();
}

function renderMatchDetail(m) {
  const pred = predictMatch(m.home.name, m.away.name, true);

  const showScore = m.state !== "pre" && m.home.score != null;
  const homeWin = m.state === "post" && m.home.score > m.away.score;
  const awayWin = m.state === "post" && m.away.score > m.home.score;

  const stagePill = `<span class="stage-pill">${stageLabel(m.stage)}</span>`;
  const livePill = m.state === "in"
    ? `<span class="live-pill"><span class="dot"></span>LIVE${m.clock ? " · " + m.clock : ""}</span>`
    : "";

  let scoreStatus = "";
  if (m.state === "in") {
    scoreStatus = `<div class="score-status live">Đang diễn ra</div>`;
  } else if (m.state === "post") {
    scoreStatus = `<div class="score-status final">Kết thúc</div>`;
  } else {
    scoreStatus = `<div class="score-status">${formatTime(m.date)}</div>`;
  }

  const scoreHtml = showScore
    ? `<div class="score-big">${m.home.score} - ${m.away.score}</div>`
    : `<div class="score-big pre">VS</div>`;

  const homeRank = pred.home.rank
    ? `Hạng FIFA #${pred.home.rank} · ${pred.home.points} điểm`
    : "Chưa có dữ liệu xếp hạng";
  const awayRank = pred.away.rank
    ? `Hạng FIFA #${pred.away.rank} · ${pred.away.points} điểm`
    : "Chưa có dữ liệu xếp hạng";

  return `
    <div class="detail-container">
      <button class="detail-back">
        <span class="arrow">←</span>
        <span>Quay lại lịch thi đấu</span>
      </button>

      <div class="detail-hero">
        <div class="detail-meta-row">
          <div>${stagePill} ${livePill}</div>
          <div>${formatDay(m.date)} · ${formatTime(m.date)}</div>
        </div>
        <div class="detail-teams">
          <div class="detail-team ${homeWin ? "is-winner" : ""} ${awayWin ? "is-loser" : ""}">
            ${m.home.logo ? `<img class="team-logo-big" src="${m.home.logo}" alt="${escapeHtml(m.home.name)}">` : ""}
            <h2>${escapeHtml(m.home.name)}</h2>
            <div class="ranking">${homeRank}</div>
          </div>
          <div class="detail-score">
            ${scoreHtml}
            ${scoreStatus}
          </div>
          <div class="detail-team ${awayWin ? "is-winner" : ""} ${homeWin ? "is-loser" : ""}">
            ${m.away.logo ? `<img class="team-logo-big" src="${m.away.logo}" alt="${escapeHtml(m.away.name)}">` : ""}
            <h2>${escapeHtml(m.away.name)}</h2>
            <div class="ranking">${awayRank}</div>
          </div>
        </div>
      </div>

      <div class="detail-cards">
        ${renderPredictionCard(pred, m)}
        ${renderStrengthCard(pred)}
        ${renderSquadValueCard(m.home.name, m.away.name)}
        ${renderStarsCard(m.home.name, m.away.name)}
      </div>

      <div class="detail-disclaimer">
        Trang web này chỉ phục vụ mục đích học tập và tìm hiểu thống kê bóng đá.
        Dự đoán dựa trên mô hình toán học từ điểm FIFA Ranking công khai —
        không liên quan đến cá cược dưới bất kỳ hình thức nào.
      </div>
    </div>
  `;
}

function renderPredictionCard(pred, m) {
  const isPost = m.state === "post";
  const note = isPost
    ? `<div class="card-sub">Dự đoán dựa trên FIFA Ranking trước trận. Kết quả thực tế đã có ở phần tỉ số.</div>`
    : `<div class="card-sub">Mô hình logistic dựa trên điểm FIFA Ranking + lợi thế sân nhà ~30 điểm cho đội cấp trên (sân trung lập).</div>`;

  return `
    <div class="detail-card">
      <h3><span class="icon">📊</span> Dự đoán xác suất</h3>
      <div class="prob-row">
        <span class="pct" style="color:#00d4aa">${pred.pHome}%</span>
        <span style="color:var(--text-mute);font-size:11px">HÒA ${pred.pDraw}%</span>
        <span class="pct" style="color:#6366f1">${pred.pAway}%</span>
      </div>
      <div class="prob-bar">
        <div class="prob-seg home" style="flex:${pred.pHome}">${pred.pHome >= 8 ? pred.pHome + "%" : ""}</div>
        <div class="prob-seg draw" style="flex:${pred.pDraw}">${pred.pDraw >= 8 ? pred.pDraw + "%" : ""}</div>
        <div class="prob-seg away" style="flex:${pred.pAway}">${pred.pAway >= 8 ? pred.pAway + "%" : ""}</div>
      </div>
      <div class="prob-legend">
        <div><span class="swatch" style="background:#00d4aa"></span>${escapeHtml(pred.home.name)} thắng</div>
        <div><span class="swatch" style="background:#64748b"></span>Hòa</div>
        <div><span class="swatch" style="background:#6366f1"></span>${escapeHtml(pred.away.name)} thắng</div>
      </div>
      ${note}
    </div>
  `;
}

function renderStrengthCard(pred) {
  const hPts = pred.home.points;
  const aPts = pred.away.points;
  const max = Math.max(hPts, aPts);
  const diff = Math.abs(pred.diff);
  let level;
  if (diff < 30) level = "Cân tài cân sức";
  else if (diff < 80) level = "Chênh lệch nhẹ";
  else if (diff < 150) level = "Chênh lệch rõ rệt";
  else level = "Chênh lệch lớn";

  return `
    <div class="detail-card">
      <h3><span class="icon">⚖️</span> So sánh sức mạnh</h3>
      <div class="stat-list">
        <div class="stat-row">
          <div class="v v-home ${hPts >= aPts ? "better" : ""}">${hPts}</div>
          <div class="label">Điểm FIFA</div>
          <div class="v v-away ${aPts >= hPts ? "better" : ""}">${aPts}</div>
        </div>
        <div class="stat-row">
          <div class="v v-home ${pred.home.rank && (!pred.away.rank || pred.home.rank < pred.away.rank) ? "better" : ""}">
            ${pred.home.rank ? "#" + pred.home.rank : "—"}
          </div>
          <div class="label">Hạng thế giới</div>
          <div class="v v-away ${pred.away.rank && (!pred.home.rank || pred.away.rank < pred.home.rank) ? "better" : ""}">
            ${pred.away.rank ? "#" + pred.away.rank : "—"}
          </div>
        </div>
        <div class="stat-row">
          <div class="v v-home"></div>
          <div class="label">Chênh lệch</div>
          <div class="v v-away" style="text-align:center;color:var(--accent)">${diff} điểm · ${level}</div>
        </div>
      </div>
      <div class="card-sub">Số liệu lấy từ bảng FIFA/Coca-Cola Men's Ranking gần nhất trước giải.</div>
    </div>
  `;
}

function renderH2HCard(h2h, homeName, awayName) {
  const total = h2h.matches.length;
  if (total === 0) {
    return `
      <div class="detail-card">
        <h3><span class="icon">📅</span> Đối đầu trực tiếp</h3>
        <div style="text-align:center;padding:24px 0;color:var(--text-mute);font-size:13px">
          Chưa có lần đối đầu nào trong dữ liệu của giải.
        </div>
        <div class="card-sub">Chỉ tính các trận trong World Cup 2026.</div>
      </div>
    `;
  }

  const items = h2h.matches.slice(0, 5).map(m => {
    const isHomeTheHome = m.home.name === homeName;
    const sH = isHomeTheHome ? m.home.score : m.away.score;
    const sA = isHomeTheHome ? m.away.score : m.home.score;
    return `
      <div class="h2h-item">
        <span class="dt">${formatDay(m.date)}</span>
        <span class="nm nm-h">${escapeHtml(homeName)}</span>
        <span class="sc">${sH} - ${sA}</span>
        <span class="nm">${escapeHtml(awayName)}</span>
      </div>
    `;
  }).join("");

  return `
    <div class="detail-card">
      <h3><span class="icon">📅</span> Đối đầu trực tiếp</h3>
      <div class="h2h-summary">
        <div class="h2h-cell home">
          <div class="num">${h2h.wHome}</div>
          <div class="lab">${escapeHtml(homeName)} thắng</div>
        </div>
        <div class="h2h-cell draw">
          <div class="num">${h2h.draws}</div>
          <div class="lab">Hòa</div>
        </div>
        <div class="h2h-cell away">
          <div class="num">${h2h.wAway}</div>
          <div class="lab">${escapeHtml(awayName)} thắng</div>
        </div>
      </div>
      <div class="h2h-list">${items}</div>
      <div class="card-sub">${total} trận trong giải · Tỉ số: ${h2h.gfHome}-${h2h.gfAway}</div>
    </div>
  `;
}

function renderInfoCard(m, pred) {
  const venueText = m.venue
    ? (m.venueCity ? `${m.venue}, ${m.venueCity}` : m.venue)
    : "Chưa rõ";

  const fav = pred.pHome > pred.pAway ? pred.home.name : pred.away.name;
  const favPct = Math.max(pred.pHome, pred.pAway);

  return `
    <div class="detail-card">
      <h3><span class="icon">ℹ️</span> Thông tin trận đấu</h3>
      <div class="info-row">
        <span class="lab">Vòng đấu</span>
        <span class="val">${stageLabel(m.stage)}</span>
      </div>
      <div class="info-row">
        <span class="lab">Ngày giờ</span>
        <span class="val">${formatDay(m.date)} · ${formatTime(m.date)}</span>
      </div>
      <div class="info-row">
        <span class="lab">Sân</span>
        <span class="val">${escapeHtml(venueText)}</span>
      </div>
      <div class="info-row">
        <span class="lab">Trạng thái</span>
        <span class="val">${escapeHtml(m.statusDetail || statusText(m))}</span>
      </div>
      <div class="info-row">
        <span class="lab">Đội được đánh giá cao</span>
        <span class="val">${escapeHtml(fav)} (${favPct}%)</span>
      </div>
    </div>
  `;
}

// ============================================================
// Squad value + stars cards
// ============================================================

function renderSquadValueCard(homeName, awayName) {
  const hSq = getSquad(homeName);
  const aSq = getSquad(awayName);

  if (!hSq && !aSq) return "";

  const hVal = hSq?.valueM ?? 0;
  const aVal = aSq?.valueM ?? 0;
  const max = Math.max(hVal, aVal, 1);
  const hPct = (hVal / max) * 100;
  const aPct = (aVal / max) * 100;

  const ratio = hVal && aVal ? (hVal / aVal).toFixed(2) : "—";
  const richer = hVal > aVal ? homeName : awayName;
  const diff = Math.abs(hVal - aVal);

  return `
    <div class="detail-card">
      <h3><span class="icon">💰</span> Giá trị đội hình</h3>
      <div class="value-row">
        <div class="value-side">
          <div class="value-name">${escapeHtml(homeName)}</div>
          <div class="value-num">${hSq ? "€" + hVal + "M" : "—"}</div>
          <div class="value-bar"><div class="value-bar-fill home" style="width:${hPct}%"></div></div>
          <div class="value-meta">${hSq ? `Tuổi TB: ${hSq.avgAge}` : "Chưa có dữ liệu"}</div>
        </div>
        <div class="value-side">
          <div class="value-name">${escapeHtml(awayName)}</div>
          <div class="value-num">${aSq ? "€" + aVal + "M" : "—"}</div>
          <div class="value-bar"><div class="value-bar-fill away" style="width:${aPct}%"></div></div>
          <div class="value-meta">${aSq ? `Tuổi TB: ${aSq.avgAge}` : "Chưa có dữ liệu"}</div>
        </div>
      </div>
      ${hSq && aSq ? `
        <div class="value-summary">
          ${escapeHtml(richer)} có giá trị cao hơn <b>€${diff}M</b> (gấp ${ratio} lần)
        </div>
      ` : ""}
      <div class="card-sub">Số liệu Transfermarkt 6/2026 — chỉ tham khảo, không phản ánh phong độ.</div>
    </div>
  `;
}

function renderStarsCard(homeName, awayName) {
  const hSq = getSquad(homeName);
  const aSq = getSquad(awayName);
  if (!hSq?.stars?.length && !aSq?.stars?.length) return "";

  const renderStarList = (stars, side) => {
    if (!stars?.length) {
      return `<div class="stars-empty">Chưa có dữ liệu</div>`;
    }
    return stars.map(s => `
      <div class="star-row">
        <div class="star-pos">${escapeHtml(s.pos || "")}</div>
        <div class="star-info">
          <div class="star-name">${escapeHtml(s.name)}</div>
          <div class="star-club">${escapeHtml(s.club || "")}</div>
        </div>
        <div class="star-value">€${s.valueM}M</div>
      </div>
    `).join("");
  };

  return `
    <div class="detail-card">
      <h3><span class="icon">⭐</span> Ngôi sao đáng chú ý</h3>
      <div class="stars-grid">
        <div class="stars-side">
          <div class="stars-team">${escapeHtml(homeName)}</div>
          ${renderStarList(hSq?.stars, "home")}
        </div>
        <div class="stars-divider"></div>
        <div class="stars-side">
          <div class="stars-team">${escapeHtml(awayName)}</div>
          ${renderStarList(aSq?.stars, "away")}
        </div>
      </div>
      <div class="card-sub">3-5 cầu thủ chủ lực mỗi đội — danh sách đăng ký chính thức có thể khác.</div>
    </div>
  `;
}
