import { members, channels } from "./utils.js";

// NOTE: cooldown is always in effect, even if left undefined.
export const respondToPattern = [
  {
    pattern: /\bvape\b/i,
    response: "we get it, you vape",
    perchance: 10,
    cooldown: undefined, // if undefined, default will be used. but can also specify a cooldown per response
  },
  {
    pattern: /\bfinna\b/i,
    response: "trying to*,  idiot",
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
    response: "https://gfycat.com/peskygreenbufflehead",
    perchance: 100,
  },
  {
    pattern: /\bi.[aeiou]a\b/gi,
    response: "I hear they make good meatballs",
    perchance: 10,
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
];

// remember these have no cooldown, so set the perchance accordingly.
// TODO: add cooldowns
// TODO: fix threaded replies
// NOTE: this is a thing: (it's the "also send to channel" checkbox)
//       type message
//       subtype thread_broadcast

export const respondToUserInChannel = [
  {
    channelMatch: channels["chan-gets-a-job"],
    userMatch: members.chan,
    response: "get a job",
    perchance: 5,
  },
  {
    channelMatch: channels.all,
    userMatch: members.slackbot,
    response: "Shut the fuck up Slackbot",
    perchance: 40,
  },
  {
    channelMatch: channels.all,
    userMatch: members.jed,
    response: "just saw this",
    perchance: 0.5,
  },
  {
    channelMatch: channels["tv-and-movies-no-hanams-allowed"],
    userMatch: members.hanam,
    response: "What are you even doing in here?",
    perchance: 25,
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

export const kickOnJoin = [
  {
    userMatch: members.hanam,
    channelMatch: channels["tv-and-movies-no-hanams-allowed"],
  },
  {
    userMatch: members.brett,
    channelMatch: channels["testing-new-channel"],
  },
];
