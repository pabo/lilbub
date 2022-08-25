const { members, channels } = require("./utils");

// NOTE: cooldown is always in effect, even if left undefined.
const respondToPattern = [
  {
    pattern: /ur[au]gu?ay/i,
    response: "no, you're a gay",
    perchance: 100,
    cooldown: undefined, // if undefined, default will be used. but can also specify a cooldown per response
  },
  {
    pattern: /paragu?ay/i,
    response: "no, you're a pair of gays",
    perchance: 100,
  },
  {
    pattern: /\bgay\b/i,
    response: "I don't know how to tell my parents that I'm gay",
    perchance: 1,
  },
  {
    pattern: /\bdamn?\b/i,
    response:
      "https://i.kym-cdn.com/photos/images/newsfeed/000/971/686/891.jpg",
    perchance: 100,
  },
  {
    pattern: /\byou people\b/i,
    response: "what do you mean `you people`",
    perchance: 100,
  },
];

const respondToUserInChannel = [
  {
    channelMatch: channels["chan-gets-a-job"],
    userMatch: members.chan,
    response: "get a job",
    perchance: 5,
  },
  {
    channelMatch: channels.all,
    userMatch: members.jed,
    response: "just saw this",
    perchance: 2,
  },
  {
    channelMatch: channels["tv-and-movies-no-hanams-allowed"],
    userMatch: members.hanam,
    response: "What are you even doing in here?",
    perchance: 25,
  },
];

const reactionsByPattern = [
  {
    pattern: /\b(gay|chris)\b/i,
    reactions: [
      ["gayseal"],
      ["le-gay"],
      ["gaycurious"],
      ["fabulously-gay"],
      ["erik_pretty"],
    ],
  },
  {
    pattern: /\bjesse\b/i,
    reactions: [["peanuts"]],
  },
  {
    pattern: /\bhow long\b/i,
    reactions: [["eggchan"], ["chan"], ["cn"], ["dragon"]],
  },
  {
    pattern: /\bquote\b/i,
    reactions: [["airquotes", "airquotes-left"]],
  },
];

// not implemented lol
const kickOnMention = [
  {
    pattern: /\bsoup\b/i,
  },
];

const kickOnJoin = [
  {
    userMatch: members.hanam,
    channelMatch: channels["tv-and-movies-no-hanams-allowed"],
  },
  {
    userMatch: members.brett,
    channelMatch: channels["testing-new-channel"],
  },
];

module.exports = {
  reactionsByPattern,
  respondToPattern,
  respondToUserInChannel,
  kickOnJoin,
  kickOnMention,
};
