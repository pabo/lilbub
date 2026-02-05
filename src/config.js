import { members, channels } from "./utils.js";

export const kickOnJoin = [
  {
    userMatch: members.brett,
    channelMatch: channels["testing-new-channel"],
  },
  {
    userMatch: members.chan,
    channelMatch: channels["nel"],
  },
  {
    userMatch: members.brett,
    channelMatch: channels["brett-er-off-without-him"],
  },
  {
    userMatch: members.chris,
    channelMatch: channels["chriss-less"],
  },
];

// NOTE: cooldown is always in effect, even if left undefined.
export const respondToPattern = [
  {
    pattern: /\bwake up.*lil buddy\b/i,
    response: "WHAT YEAR IS IT?!",
    perchance: 100,
  },
  {
    pattern: /\bvape\b/i,
    response: "we get it, you vape",
    perchance: 10,
    cooldown: undefined, // if undefined, default will be used. but can also specify a cooldown per response
  },
  {
    pattern: /\bfinna\b/i,
    response: "trying to*, idiot",
    perchance: 100,
  },
  {
    pattern: /\bdamn?\b/i,
    response:
      "https://i.kym-cdn.com/photos/images/newsfeed/000/971/686/891.jpg",
    perchance: 10,
  },
  {
    pattern: /\byou people\b/i,
    response: "what do you mean `you people`",
    perchance: 100,
  },
  {
    pattern: /\bsurf/i,
    response: "o of t of OO E or ooOO OO ah",
    perchance: 100,
  },
  {
    pattern: /\blalo\b/i,
    // response: "https://gfycat.com/peskygreenbufflehead",
    response: "https://giphy.com/gifs/bettercallsaulAMC-better-call-saul-bcs-s5-510-iDyF9dOL6nG4uS2S1z",
    perchance: 100,
  },
  {
    pattern: /\bi.[aeiou]a\b/gi,
    response: "I hear they make good meatballs",
    perchance: 5,
    cooldown: 1800,
    quoteMatchedPortion: true,
  },
  {
    pattern: /\bwelcome\b/i,
    response: "https://giphy.com/gifs/party-FOfe8iGdAiODS",
    perchance: 100,
  },
  {
    pattern: /\blil ?bub\b/i,
    response: "Get my bot's name out yo fuckin' mouth",
    perchance: 10,
    cooldown: 3600,
  },
  {
    pattern: /\bpopover\b/i,
    response: "more like poop over",
    perchance: 100,
    cooldown: 7200,
  },
];

// remember these have no cooldown, so set the perchance accordingly.
// TODO: add cooldowns
// NOTE: this is a thing: (it's the "also send to channel" checkbox)
//       type message
//       subtype thread_broadcast

export const respondToUserInChannel = [
  // until next time...
  // {
  //   channelMatch: channels["chan-gets-a-job"],
  //   userMatch: members.chan,
  //   response: ["get a job"],
  //   perchance: 5,
  // },
  {
    channelMatch: channels["brett-gets-a-job"],
    userMatch: members.brett,
    response: ["dude, get a job already"],
    perchance: 5,
  },
  {
    channelMatch: channels.all,
    userMatch: members.slackbot,
    response: ["Shut the fuck up Slackbot"],
    perchance: 5,
  },
  {
    channelMatch: channels.all,
    userMatch: members.jed,
    response: ["just saw this"],
    perchance: 0.5,
  },
  ...kickOnJoin.map(config => {
    return {
      channelMatch: config.channelMatch,
      userMatch: config.userMatch,
      response: [
        "What are you even doing in here?",
        "He doesn't even GO here!",
        "Someone call the police!",
        "Bye, Felicia!"
      ],
      perchance: 100,
    }
  }),
  {
    channelMatch: channels.all,
    userMatch: members.changpt,
    response: ["BRO AS AN AI LANGUAGE MODEL YOU FUCKING SUCK"],
    perchance: 10,
  },
];

// reactions is an array of arrays. the bot will choose one of the outer array elements at random, and then add all reactions in that inner array
export const reactionsByPattern = [
  {
    pattern: /\b(chris)\b/i,
    reactions: [["giggety"], ["chris"], ["catbug"]],
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
  {
    pattern: /^\.$/i,
    reactions: [["shifty"], ["shifty_eyes"]],
  },
  {
    pattern: /\boh+ (yeah*|no+)\b/i,
    reactions: [["oh-yea"]],
  },
];

// not implemented lol
export const kickOnMention = [
  {
    pattern: /\bsoup\b/i,
  },
];
