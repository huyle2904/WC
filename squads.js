// Squad data for World Cup 2026 — hardcoded snapshot.
// Sources: Transfermarkt squad valuations (June 2026), Wikipedia squad lists.
// Values are in millions of EUR. Stars are 3-5 most prominent players per team.
// Used for educational stats comparison only — not betting/financial advice.

const SQUADS = {
  "Argentina": {
    valueM: 545,
    avgAge: 28.4,
    stars: [
      { name: "Lionel Messi", pos: "RW", club: "Inter Miami", valueM: 18 },
      { name: "Lautaro Martínez", pos: "ST", club: "Inter Milan", valueM: 110 },
      { name: "Julián Álvarez", pos: "ST", club: "Atlético Madrid", valueM: 100 },
      { name: "Enzo Fernández", pos: "CM", club: "Chelsea", valueM: 70 },
      { name: "Alexis Mac Allister", pos: "CM", club: "Liverpool", valueM: 75 }
    ]
  },
  "Spain": {
    valueM: 1240,
    avgAge: 26.1,
    stars: [
      { name: "Lamine Yamal", pos: "RW", club: "Barcelona", valueM: 200 },
      { name: "Pedri", pos: "CM", club: "Barcelona", valueM: 140 },
      { name: "Rodri", pos: "DM", club: "Manchester City", valueM: 110 },
      { name: "Nico Williams", pos: "LW", club: "Athletic Bilbao", valueM: 75 },
      { name: "Dani Olmo", pos: "AM", club: "Barcelona", valueM: 80 }
    ]
  },
  "France": {
    valueM: 1180,
    avgAge: 26.5,
    stars: [
      { name: "Kylian Mbappé", pos: "ST", club: "Real Madrid", valueM: 180 },
      { name: "Aurélien Tchouaméni", pos: "DM", club: "Real Madrid", valueM: 90 },
      { name: "Eduardo Camavinga", pos: "CM", club: "Real Madrid", valueM: 80 },
      { name: "Ousmane Dembélé", pos: "RW", club: "PSG", valueM: 75 },
      { name: "Bradley Barcola", pos: "LW", club: "PSG", valueM: 70 }
    ]
  },
  "England": {
    valueM: 1370,
    avgAge: 25.8,
    stars: [
      { name: "Jude Bellingham", pos: "AM", club: "Real Madrid", valueM: 180 },
      { name: "Bukayo Saka", pos: "RW", club: "Arsenal", valueM: 130 },
      { name: "Phil Foden", pos: "AM", club: "Manchester City", valueM: 130 },
      { name: "Cole Palmer", pos: "AM", club: "Chelsea", valueM: 120 },
      { name: "Declan Rice", pos: "DM", club: "Arsenal", valueM: 100 }
    ]
  },
  "Brazil": {
    valueM: 980,
    avgAge: 26.7,
    stars: [
      { name: "Vinícius Júnior", pos: "LW", club: "Real Madrid", valueM: 170 },
      { name: "Rodrygo", pos: "RW", club: "Real Madrid", valueM: 90 },
      { name: "Bruno Guimarães", pos: "DM", club: "Newcastle", valueM: 75 },
      { name: "Endrick", pos: "ST", club: "Real Madrid", valueM: 70 },
      { name: "Estêvão", pos: "RW", club: "Chelsea", valueM: 70 }
    ]
  }
};

// Tier 2: Rank 6-15 (strong contenders)
SQUADS["Netherlands"] = {
  valueM: 750, avgAge: 26.0,
  stars: [
    { name: "Virgil van Dijk", pos: "CB", club: "Liverpool", valueM: 18 },
    { name: "Cody Gakpo", pos: "LW", club: "Liverpool", valueM: 75 },
    { name: "Frenkie de Jong", pos: "CM", club: "Barcelona", valueM: 50 },
    { name: "Xavi Simons", pos: "AM", club: "RB Leipzig", valueM: 80 },
    { name: "Jeremie Frimpong", pos: "RB", club: "Liverpool", valueM: 50 }
  ]
};

SQUADS["Portugal"] = {
  valueM: 920, avgAge: 26.3,
  stars: [
    { name: "Cristiano Ronaldo", pos: "ST", club: "Al-Nassr", valueM: 5 },
    { name: "Bruno Fernandes", pos: "AM", club: "Manchester United", valueM: 65 },
    { name: "Bernardo Silva", pos: "AM", club: "Manchester City", valueM: 60 },
    { name: "Rafael Leão", pos: "LW", club: "AC Milan", valueM: 80 },
    { name: "João Neves", pos: "DM", club: "PSG", valueM: 80 }
  ]
};

SQUADS["Belgium"] = {
  valueM: 580, avgAge: 27.4,
  stars: [
    { name: "Kevin De Bruyne", pos: "AM", club: "Napoli", valueM: 25 },
    { name: "Jérémy Doku", pos: "LW", club: "Manchester City", valueM: 65 },
    { name: "Romelu Lukaku", pos: "ST", club: "Napoli", valueM: 25 },
    { name: "Amadou Onana", pos: "DM", club: "Aston Villa", valueM: 50 },
    { name: "Charles De Ketelaere", pos: "AM", club: "Atalanta", valueM: 40 }
  ]
};

SQUADS["Germany"] = {
  valueM: 880, avgAge: 26.7,
  stars: [
    { name: "Jamal Musiala", pos: "AM", club: "Bayern Munich", valueM: 130 },
    { name: "Florian Wirtz", pos: "AM", club: "Liverpool", valueM: 130 },
    { name: "Kai Havertz", pos: "ST", club: "Arsenal", valueM: 70 },
    { name: "Joshua Kimmich", pos: "DM", club: "Bayern Munich", valueM: 50 },
    { name: "Antonio Rüdiger", pos: "CB", club: "Real Madrid", valueM: 30 }
  ]
};

SQUADS["Croatia"] = {
  valueM: 380, avgAge: 28.9,
  stars: [
    { name: "Luka Modrić", pos: "CM", club: "AC Milan", valueM: 5 },
    { name: "Joško Gvardiol", pos: "CB", club: "Manchester City", valueM: 75 },
    { name: "Mateo Kovačić", pos: "CM", club: "Manchester City", valueM: 35 },
    { name: "Andrej Kramarić", pos: "ST", club: "Hoffenheim", valueM: 6 }
  ]
};

SQUADS["Italy"] = {
  valueM: 720, avgAge: 26.5,
  stars: [
    { name: "Federico Chiesa", pos: "RW", club: "Liverpool", valueM: 35 },
    { name: "Sandro Tonali", pos: "DM", club: "Newcastle", valueM: 55 },
    { name: "Nicolò Barella", pos: "CM", club: "Inter Milan", valueM: 70 },
    { name: "Gianluigi Donnarumma", pos: "GK", club: "PSG", valueM: 40 },
    { name: "Alessandro Bastoni", pos: "CB", club: "Inter Milan", valueM: 60 }
  ]
};

SQUADS["Morocco"] = {
  valueM: 320, avgAge: 26.8,
  stars: [
    { name: "Achraf Hakimi", pos: "RB", club: "PSG", valueM: 70 },
    { name: "Brahim Díaz", pos: "AM", club: "Real Madrid", valueM: 45 },
    { name: "Hakim Ziyech", pos: "AM", club: "Al-Duhail", valueM: 6 },
    { name: "Bilal El Khannouss", pos: "AM", club: "Leicester", valueM: 25 }
  ]
};

SQUADS["Colombia"] = {
  valueM: 280, avgAge: 27.2,
  stars: [
    { name: "Luis Díaz", pos: "LW", club: "Bayern Munich", valueM: 70 },
    { name: "James Rodríguez", pos: "AM", club: "Club León", valueM: 5 },
    { name: "Jhon Durán", pos: "ST", club: "Al-Nassr", valueM: 35 },
    { name: "Daniel Muñoz", pos: "RB", club: "Crystal Palace", valueM: 25 }
  ]
};

SQUADS["Uruguay"] = {
  valueM: 380, avgAge: 27.0,
  stars: [
    { name: "Federico Valverde", pos: "CM", club: "Real Madrid", valueM: 130 },
    { name: "Darwin Núñez", pos: "ST", club: "Al-Hilal", valueM: 50 },
    { name: "Ronald Araújo", pos: "CB", club: "Barcelona", valueM: 60 },
    { name: "Manuel Ugarte", pos: "DM", club: "Manchester United", valueM: 35 }
  ]
};

SQUADS["United States"] = {
  valueM: 320, avgAge: 26.5,
  stars: [
    { name: "Christian Pulisic", pos: "RW", club: "AC Milan", valueM: 40 },
    { name: "Weston McKennie", pos: "CM", club: "Juventus", valueM: 22 },
    { name: "Tyler Adams", pos: "DM", club: "Bournemouth", valueM: 18 },
    { name: "Folarin Balogun", pos: "ST", club: "Monaco", valueM: 25 }
  ]
};
SQUADS["USA"] = SQUADS["United States"];

SQUADS["Mexico"] = {
  valueM: 180, avgAge: 27.5,
  stars: [
    { name: "Edson Álvarez", pos: "DM", club: "Fenerbahçe", valueM: 22 },
    { name: "Hirving Lozano", pos: "RW", club: "San Diego FC", valueM: 12 },
    { name: "Santiago Giménez", pos: "ST", club: "AC Milan", valueM: 30 },
    { name: "Luis Romo", pos: "DM", club: "Cruz Azul", valueM: 8 }
  ]
};

SQUADS["Switzerland"] = {
  valueM: 270, avgAge: 27.8,
  stars: [
    { name: "Granit Xhaka", pos: "DM", club: "Sunderland", valueM: 16 },
    { name: "Manuel Akanji", pos: "CB", club: "Manchester City", valueM: 30 },
    { name: "Xherdan Shaqiri", pos: "AM", club: "Chicago Fire", valueM: 4 },
    { name: "Breel Embolo", pos: "ST", club: "Monaco", valueM: 18 }
  ]
};

SQUADS["Senegal"] = {
  valueM: 290, avgAge: 27.5,
  stars: [
    { name: "Sadio Mané", pos: "LW", club: "Al-Nassr", valueM: 12 },
    { name: "Édouard Mendy", pos: "GK", club: "Al-Ahli", valueM: 8 },
    { name: "Kalidou Koulibaly", pos: "CB", club: "Al-Hilal", valueM: 8 },
    { name: "Nicolas Jackson", pos: "ST", club: "Bayern Munich", valueM: 50 }
  ]
};

SQUADS["Japan"] = {
  valueM: 320, avgAge: 26.0,
  stars: [
    { name: "Takefusa Kubo", pos: "RW", club: "Real Sociedad", valueM: 50 },
    { name: "Kaoru Mitoma", pos: "LW", club: "Brighton", valueM: 45 },
    { name: "Wataru Endō", pos: "DM", club: "Liverpool", valueM: 12 },
    { name: "Daichi Kamada", pos: "AM", club: "Crystal Palace", valueM: 22 }
  ]
};

SQUADS["Denmark"] = {
  valueM: 320, avgAge: 27.0,
  stars: [
    { name: "Christian Eriksen", pos: "AM", club: "Manchester United", valueM: 8 },
    { name: "Pierre-Emile Højbjerg", pos: "DM", club: "Marseille", valueM: 22 },
    { name: "Rasmus Højlund", pos: "ST", club: "Manchester United", valueM: 35 },
    { name: "Mikkel Damsgaard", pos: "AM", club: "Brentford", valueM: 25 }
  ]
};

SQUADS["Iran"] = {
  valueM: 90, avgAge: 28.5,
  stars: [
    { name: "Mehdi Taremi", pos: "ST", club: "Inter Milan", valueM: 14 },
    { name: "Sardar Azmoun", pos: "ST", club: "Shabab Al-Ahli", valueM: 6 },
    { name: "Alireza Jahanbakhsh", pos: "RW", club: "Heerenveen", valueM: 4 }
  ]
};

SQUADS["South Korea"] = {
  valueM: 220, avgAge: 26.0,
  stars: [
    { name: "Son Heung-min", pos: "LW", club: "LAFC", valueM: 12 },
    { name: "Lee Kang-in", pos: "AM", club: "PSG", valueM: 35 },
    { name: "Kim Min-jae", pos: "CB", club: "Bayern Munich", valueM: 40 },
    { name: "Hwang Hee-chan", pos: "LW", club: "Wolves", valueM: 18 }
  ]
};

SQUADS["Ecuador"] = {
  valueM: 180, avgAge: 25.0,
  stars: [
    { name: "Moisés Caicedo", pos: "DM", club: "Chelsea", valueM: 75 },
    { name: "Pervis Estupiñán", pos: "LB", club: "AC Milan", valueM: 25 },
    { name: "Kendry Páez", pos: "AM", club: "Strasbourg", valueM: 25 }
  ]
};

SQUADS["Austria"] = {
  valueM: 280, avgAge: 27.5,
  stars: [
    { name: "Marcel Sabitzer", pos: "CM", club: "Borussia Dortmund", valueM: 22 },
    { name: "Konrad Laimer", pos: "DM", club: "Bayern Munich", valueM: 25 },
    { name: "Marko Arnautović", pos: "ST", club: "Inter Miami", valueM: 3 },
    { name: "David Alaba", pos: "CB", club: "Real Madrid", valueM: 12 }
  ]
};

SQUADS["Australia"] = {
  valueM: 80, avgAge: 27.5,
  stars: [
    { name: "Mathew Ryan", pos: "GK", club: "Lens", valueM: 1 },
    { name: "Jackson Irvine", pos: "CM", club: "St. Pauli", valueM: 4 },
    { name: "Riley McGree", pos: "AM", club: "Middlesbrough", valueM: 6 }
  ]
};

SQUADS["Türkiye"] = {
  valueM: 480, avgAge: 25.5,
  stars: [
    { name: "Arda Güler", pos: "AM", club: "Real Madrid", valueM: 60 },
    { name: "Hakan Çalhanoğlu", pos: "DM", club: "Inter Milan", valueM: 35 },
    { name: "Kenan Yıldız", pos: "AM", club: "Juventus", valueM: 75 },
    { name: "Ferdi Kadıoğlu", pos: "LB", club: "Brighton", valueM: 30 }
  ]
};
SQUADS["Turkey"] = SQUADS["Türkiye"];

SQUADS["Wales"] = {
  valueM: 140, avgAge: 27.0,
  stars: [
    { name: "Daniel James", pos: "RW", club: "Leeds", valueM: 12 },
    { name: "Brennan Johnson", pos: "RW", club: "Tottenham", valueM: 35 },
    { name: "Joe Rodon", pos: "CB", club: "Leeds", valueM: 12 }
  ]
};

SQUADS["Tunisia"] = {
  valueM: 50, avgAge: 27.0,
  stars: [
    { name: "Hannibal Mejbri", pos: "AM", club: "Burnley", valueM: 12 },
    { name: "Ellyes Skhiri", pos: "DM", club: "Eintracht Frankfurt", valueM: 14 },
    { name: "Aïssa Laidouni", pos: "DM", club: "Hellas Verona", valueM: 6 }
  ]
};

SQUADS["Egypt"] = {
  valueM: 110, avgAge: 27.5,
  stars: [
    { name: "Mohamed Salah", pos: "RW", club: "Liverpool", valueM: 50 },
    { name: "Mohamed Elneny", pos: "DM", club: "Al-Jazira", valueM: 2 },
    { name: "Trézéguet", pos: "RW", club: "Trabzonspor", valueM: 6 }
  ]
};

SQUADS["Norway"] = {
  valueM: 380, avgAge: 25.5,
  stars: [
    { name: "Erling Haaland", pos: "ST", club: "Manchester City", valueM: 200 },
    { name: "Martin Ødegaard", pos: "AM", club: "Arsenal", valueM: 90 },
    { name: "Alexander Sørloth", pos: "ST", club: "Atlético Madrid", valueM: 35 },
    { name: "Antonio Nusa", pos: "LW", club: "RB Leipzig", valueM: 35 }
  ]
};

SQUADS["Czech Republic"] = {
  valueM: 130, avgAge: 26.5,
  stars: [
    { name: "Patrik Schick", pos: "ST", club: "Bayer Leverkusen", valueM: 25 },
    { name: "Adam Hložek", pos: "ST", club: "Hoffenheim", valueM: 18 },
    { name: "Tomáš Souček", pos: "DM", club: "West Ham", valueM: 18 }
  ]
};
SQUADS["Czechia"] = SQUADS["Czech Republic"];

SQUADS["Algeria"] = {
  valueM: 95, avgAge: 27.0,
  stars: [
    { name: "Riyad Mahrez", pos: "RW", club: "Al-Ahli", valueM: 14 },
    { name: "Ismaël Bennacer", pos: "DM", club: "Marseille", valueM: 18 },
    { name: "Houssem Aouar", pos: "AM", club: "Al-Ittihad", valueM: 8 }
  ]
};

SQUADS["Panama"] = {
  valueM: 35, avgAge: 27.5,
  stars: [
    { name: "Adalberto Carrasquilla", pos: "DM", club: "Pumas", valueM: 5 },
    { name: "Aníbal Godoy", pos: "DM", club: "San Jose Earthquakes", valueM: 1 }
  ]
};

SQUADS["Canada"] = {
  valueM: 90, avgAge: 26.5,
  stars: [
    { name: "Alphonso Davies", pos: "LB", club: "Bayern Munich", valueM: 60 },
    { name: "Jonathan David", pos: "ST", club: "Juventus", valueM: 50 },
    { name: "Stephen Eustáquio", pos: "DM", club: "Porto", valueM: 22 }
  ]
};

SQUADS["Poland"] = {
  valueM: 180, avgAge: 27.0,
  stars: [
    { name: "Robert Lewandowski", pos: "ST", club: "Barcelona", valueM: 12 },
    { name: "Piotr Zieliński", pos: "AM", club: "Inter Milan", valueM: 22 },
    { name: "Nicola Zalewski", pos: "LB", club: "Inter Milan", valueM: 20 }
  ]
};

SQUADS["Ivory Coast"] = {
  valueM: 230, avgAge: 26.0,
  stars: [
    { name: "Sébastien Haller", pos: "ST", club: "Borussia Dortmund", valueM: 14 },
    { name: "Franck Kessié", pos: "CM", club: "Al-Ahli", valueM: 18 },
    { name: "Nicolas Pépé", pos: "RW", club: "Villarreal", valueM: 8 },
    { name: "Simon Adingra", pos: "LW", club: "Brighton", valueM: 28 }
  ]
};
SQUADS["Côte d'Ivoire"] = SQUADS["Ivory Coast"];

SQUADS["Paraguay"] = {
  valueM: 70, avgAge: 27.0,
  stars: [
    { name: "Miguel Almirón", pos: "RW", club: "Atlanta United", valueM: 10 },
    { name: "Gustavo Gómez", pos: "CB", club: "Palmeiras", valueM: 6 },
    { name: "Julio Enciso", pos: "AM", club: "Brighton", valueM: 18 }
  ]
};

SQUADS["Cameroon"] = {
  valueM: 120, avgAge: 26.5,
  stars: [
    { name: "André Onana", pos: "GK", club: "Manchester United", valueM: 25 },
    { name: "Vincent Aboubakar", pos: "ST", club: "Hatayspor", valueM: 3 },
    { name: "Bryan Mbeumo", pos: "RW", club: "Manchester United", valueM: 50 }
  ]
};

SQUADS["Saudi Arabia"] = {
  valueM: 35, avgAge: 28.5,
  stars: [
    { name: "Salem Al-Dawsari", pos: "LW", club: "Al-Hilal", valueM: 5 },
    { name: "Saud Abdulhamid", pos: "RB", club: "Roma", valueM: 8 }
  ]
};

SQUADS["Qatar"] = {
  valueM: 25, avgAge: 27.5,
  stars: [
    { name: "Akram Afif", pos: "AM", club: "Al-Sadd", valueM: 5 },
    { name: "Almoez Ali", pos: "ST", club: "Al-Duhail", valueM: 3 }
  ]
};

SQUADS["Iraq"] = {
  valueM: 25, avgAge: 26.0,
  stars: [
    { name: "Aymen Hussein", pos: "ST", club: "Erzurumspor", valueM: 2 },
    { name: "Zidane Iqbal", pos: "AM", club: "Utrecht", valueM: 4 }
  ]
};

SQUADS["Ghana"] = {
  valueM: 110, avgAge: 26.0,
  stars: [
    { name: "Mohammed Kudus", pos: "AM", club: "Tottenham", valueM: 50 },
    { name: "Thomas Partey", pos: "DM", club: "Villarreal", valueM: 12 },
    { name: "Antoine Semenyo", pos: "LW", club: "Bournemouth", valueM: 35 }
  ]
};

SQUADS["South Africa"] = {
  valueM: 35, avgAge: 26.0,
  stars: [
    { name: "Lyle Foster", pos: "ST", club: "Burnley", valueM: 12 },
    { name: "Percy Tau", pos: "AM", club: "Al-Ahly", valueM: 3 }
  ]
};

SQUADS["Cape Verde"] = {
  valueM: 30, avgAge: 27.0,
  stars: [
    { name: "Ryan Mendes", pos: "RW", club: "Tigres", valueM: 2 }
  ]
};
SQUADS["Cabo Verde"] = SQUADS["Cape Verde"];

SQUADS["Bosnia and Herzegovina"] = {
  valueM: 95, avgAge: 27.0,
  stars: [
    { name: "Edin Džeko", pos: "ST", club: "Fenerbahçe", valueM: 3 },
    { name: "Sead Kolašinac", pos: "LB", club: "Atalanta", valueM: 6 }
  ]
};
SQUADS["Bosnia & Herzegovina"] = SQUADS["Bosnia and Herzegovina"];

SQUADS["Uzbekistan"] = {
  valueM: 35, avgAge: 25.5,
  stars: [
    { name: "Eldor Shomurodov", pos: "ST", club: "Roma", valueM: 5 },
    { name: "Abbosbek Fayzullaev", pos: "AM", club: "CSKA Moscow", valueM: 8 }
  ]
};

SQUADS["Jordan"] = {
  valueM: 18, avgAge: 27.0,
  stars: [
    { name: "Mousa Al-Tamari", pos: "RW", club: "Rennes", valueM: 12 },
    { name: "Yazan Al-Naimat", pos: "ST", club: "Al-Ahli SC", valueM: 2 }
  ]
};

SQUADS["DR Congo"] = {
  valueM: 130, avgAge: 26.0,
  stars: [
    { name: "Yoane Wissa", pos: "LW", club: "Newcastle", valueM: 30 },
    { name: "Cédric Bakambu", pos: "ST", club: "Real Betis", valueM: 4 }
  ]
};
SQUADS["Congo DR"] = SQUADS["DR Congo"];

SQUADS["Curaçao"] = {
  valueM: 12, avgAge: 28.0,
  stars: [
    { name: "Leandro Bacuna", pos: "CM", club: "Sheffield United", valueM: 1 }
  ]
};
SQUADS["Curacao"] = SQUADS["Curaçao"];

SQUADS["Haiti"] = {
  valueM: 18, avgAge: 26.5,
  stars: [
    { name: "Duckens Nazon", pos: "ST", club: "Doxa Katokopias", valueM: 1 }
  ]
};

SQUADS["New Zealand"] = {
  valueM: 14, avgAge: 27.0,
  stars: [
    { name: "Chris Wood", pos: "ST", club: "Nottingham Forest", valueM: 12 }
  ]
};

SQUADS["Scotland"] = {
  valueM: 220, avgAge: 27.5,
  stars: [
    { name: "Andy Robertson", pos: "LB", club: "Liverpool", valueM: 18 },
    { name: "Scott McTominay", pos: "CM", club: "Napoli", valueM: 35 },
    { name: "Kieran Tierney", pos: "LB", club: "Celtic", valueM: 12 }
  ]
};

function getSquad(teamName) {
  if (!teamName) return null;
  if (SQUADS[teamName]) return SQUADS[teamName];
  const lower = teamName.toLowerCase();
  for (const k in SQUADS) {
    if (k.toLowerCase() === lower) return SQUADS[k];
  }
  return null;
}
