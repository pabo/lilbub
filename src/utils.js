const pad = (number) => {
  return number < 10 ? `0${number}` : number
}

export const durationDisplayFromSeconds = (s) => {
  const fractionalHours = s/3600;

  const hours = Math.floor(fractionalHours);

  const fractionalMinutes = (fractionalHours - hours) * 60;
  
  const minutes = Math.floor(fractionalMinutes);

  const seconds = Math.floor((fractionalMinutes - minutes) * 60);

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export const dieRoll = (chance) => {
  const d100roll = Math.random() * 100;
  console.log(`dieRoll ${d100roll} <= ${chance}`);
  return d100roll <= chance;
};

export const members = {
  alex: "U012A4QRQTG",
  ben: "U0132AY2BCH",
  blaine: "U012PTDR7PD",
  braude: "U01L8PV7AF4",
  brett: "U012FAHGTB7",
  brian: "U013B8WQD51",
  chan: "U0136UH7V3J",
  chris: "U012E1NHRD4",
  erik: "U012223FVT9",
  gegan: "U01GMVC1E9Y",
  gevans: "U012GNATCUA",
  greg: "U012238MWJK",
  hanam: "U012MRK5RJR",
  james: "U0122BGBAPR",
  jed: "U012HE0ACDQ",
  jesse: "U012N9HN1EZ",
  josh: "U01GR9QKNAY",
  kevin: "U013736LETS",
  narendra: "U012LRFBZMY",
  plaster: "U01220V5U0P",
  prabu: "U012M48M3JP",
  solorio: "U01H90MMQBS",
  tom: "U013DD9RP6C",
  wlee: "U01GU4R8YMS",
  vitaliy: "U02PK4NVDQC",

  lilbub: "U03TSKB0MJR",
  slackbot: "USLACKBOT",

  //Polly: "U013AMN9TGQ",
  //undefined: "U018D3454BF",
  //undefined: "U01GCCUF3KQ",
  //undefined: "U01GXPFRXL1",
  //undefined: "U021N0A6BBQ",
  //Cryptocurrency Alerting: "U021V0L0T43",
  //spellmoji: "U02JCH9TPH6",
  //Distill.io Notifier: "U03JWJ4410F",
  //Lil Bub: "U03TSKB0MJR",
};

export const membersById = {};
Object.entries(members).forEach(([name, id]) => {
  membersById[id] = name;
});

export const channels = {
  "testing-new-channel": "C03TPEWN2MC",
  "tv-and-movies-no-hanams-allowed": "C03TS27AN2H",
  "lil-bub-dev": "C03TVR0JDC3",
  "chan-gets-a-job": "C03RTAMR2L",
  "job-shit": "C01A8CC9E92",
  "test-brett": "C02HR1NR4H2",
  all: "ALL_CHANNELS",
};
