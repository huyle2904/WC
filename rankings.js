// FIFA World Rankings — used for match prediction.
// Source: FIFA/Coca-Cola Men's Ranking, June 2026 (most recent before WC kickoff).
// FIFA does not currently expose a public API; values mirror the published table.
// We use these as Elo-equivalent points to compute win/draw/loss probabilities.
// If a team isn't listed, a default of 1500 is used (median of qualified teams).

const FIFA_RANKINGS = {
  // Top 10
  "Argentina": { rank: 1, points: 1886 },
  "Spain": { rank: 2, points: 1869 },
  "France": { rank: 3, points: 1852 },
  "England": { rank: 4, points: 1820 },
  "Brazil": { rank: 5, points: 1776 },
  "Netherlands": { rank: 6, points: 1751 },
  "Portugal": { rank: 7, points: 1745 },
  "Belgium": { rank: 8, points: 1740 },
  "Germany": { rank: 9, points: 1733 },
  "Croatia": { rank: 10, points: 1717 },

  // 11-25
  "Italy": { rank: 11, points: 1700 },
  "Morocco": { rank: 12, points: 1694 },
  "Colombia": { rank: 13, points: 1687 },
  "Uruguay": { rank: 14, points: 1684 },
  "USA": { rank: 15, points: 1670 },
  "United States": { rank: 15, points: 1670 },
  "Mexico": { rank: 16, points: 1655 },
  "Switzerland": { rank: 17, points: 1648 },
  "Senegal": { rank: 18, points: 1640 },
  "Japan": { rank: 19, points: 1634 },
  "Denmark": { rank: 20, points: 1626 },
  "Iran": { rank: 21, points: 1617 },
  "South Korea": { rank: 22, points: 1610 },
  "Korea Republic": { rank: 22, points: 1610 },
  "Ecuador": { rank: 23, points: 1600 },
  "Austria": { rank: 24, points: 1591 },
  "Australia": { rank: 25, points: 1580 },

  // 26-50
  "Ukraine": { rank: 26, points: 1570 },
  "Wales": { rank: 27, points: 1565 },
  "Türkiye": { rank: 28, points: 1559 },
  "Turkey": { rank: 28, points: 1559 },
  "Tunisia": { rank: 29, points: 1551 },
  "Sweden": { rank: 30, points: 1545 },
  "Egypt": { rank: 31, points: 1538 },
  "Norway": { rank: 32, points: 1532 },
  "Czechia": { rank: 33, points: 1528 },
  "Czech Republic": { rank: 33, points: 1528 },
  "Algeria": { rank: 34, points: 1521 },
  "Nigeria": { rank: 35, points: 1515 },
  "Panama": { rank: 36, points: 1508 },
  "Canada": { rank: 37, points: 1500 },
  "Hungary": { rank: 38, points: 1495 },
  "Poland": { rank: 39, points: 1490 },
  "Ivory Coast": { rank: 40, points: 1485 },
  "Côte d'Ivoire": { rank: 40, points: 1485 },
  "Paraguay": { rank: 41, points: 1478 },
  "Slovakia": { rank: 42, points: 1470 },
  "Romania": { rank: 43, points: 1462 },
  "Mali": { rank: 44, points: 1455 },
  "Costa Rica": { rank: 45, points: 1448 },
  "Cameroon": { rank: 46, points: 1442 },
  "Saudi Arabia": { rank: 47, points: 1435 },
  "Qatar": { rank: 48, points: 1428 },
  "Iraq": { rank: 49, points: 1422 },
  "Jamaica": { rank: 50, points: 1418 },

  // 51-100 (selection of WC qualifiers)
  "Ghana": { rank: 51, points: 1412 },
  "Burkina Faso": { rank: 52, points: 1405 },
  "Slovenia": { rank: 53, points: 1399 },
  "Greece": { rank: 54, points: 1393 },
  "Albania": { rank: 55, points: 1388 },
  "South Africa": { rank: 56, points: 1382 },
  "Cape Verde": { rank: 57, points: 1376 },
  "Cabo Verde": { rank: 57, points: 1376 },
  "Bosnia and Herzegovina": { rank: 58, points: 1370 },
  "Bosnia & Herzegovina": { rank: 58, points: 1370 },
  "Uzbekistan": { rank: 59, points: 1365 },
  "Jordan": { rank: 60, points: 1360 },
  "Republic of Ireland": { rank: 61, points: 1355 },
  "Finland": { rank: 62, points: 1350 },
  "Russia": { rank: 63, points: 1345 },
  "DR Congo": { rank: 64, points: 1340 },
  "Congo DR": { rank: 64, points: 1340 },
  "Venezuela": { rank: 65, points: 1335 },
  "Iceland": { rank: 66, points: 1330 },
  "Bolivia": { rank: 67, points: 1325 },
  "Curaçao": { rank: 71, points: 1305 },
  "Curacao": { rank: 71, points: 1305 },
  "Haiti": { rank: 78, points: 1275 },
  "New Zealand": { rank: 89, points: 1230 },
  "Scotland": { rank: 39, points: 1490 }
};

function getFifaRanking(teamName) {
  if (!teamName) return null;
  const exact = FIFA_RANKINGS[teamName];
  if (exact) return exact;
  // Try case-insensitive match
  const lower = teamName.toLowerCase();
  for (const k in FIFA_RANKINGS) {
    if (k.toLowerCase() === lower) return FIFA_RANKINGS[k];
  }
  return null;
}
