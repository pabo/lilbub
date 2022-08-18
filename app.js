const { App } = require("@slack/bolt");
const initSpellmoji = require("./spellmoji");
const initThanos = require("./thanos");
const { dieRoll, members, channels } = require("./utils");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});


// const getUserInfo = async () => {
//   const info = await app.client.users.list();

//   info.members.forEach(m => {
//     console.log(`${m.real_name}: "${m.id}",`);
//   }) 
// }

// getUserInfo();



initSpellmoji(app);
initThanos(app);

// VVVV edit these configs to add more use cases VVVV

const respondToPattern = [
  {
    pattern: /ur[au]gu?ay/i,
    response: "no, you're a gay",
    perchance: 100,
  },
  {
    pattern: /gay/i,
    response: "I don't know how to tell my parents that I'm gay",
    perchance: 1,
  },
];

const respondToUserInChannel = [
  {
    channelMatch: channels["chan-gets-a-job"],
    userMatch: members.chan,
    response: "get a job",
    perchance: 5,
  },
];

const emojiReponses = [
  {
    pattern: /(gay|chris)/i,
    emojis: [
      "gayseal",
      "le-gay",
      "gaycurious",
      "fabulously-gay",
      "erik_pretty",
    ],
  },
];

// not implemented lol
const kickOnMention = [
  {
    pattern: /soup/i,
  }
];

const kickOnJoin = [
  {
    userMatch: members.chan,
    channelMatch: channels["lil-bub-dev"],
  },
  {
    userMatch: members.hanam,
    channelMatch: channels["tv-and-movies-no-hanams-allowed"],
  },
  {
    userMatch: members.brett,
    channelMatch: channels["testing-new-channel"],
  },
];

// ^^^^ edit these configs to add more use cases ^^^^

for (const entry of respondToPattern) {
  const { pattern, response, perchance } = entry;
  app.message(pattern, async ({ message, say }) => {
    if (dieRoll(perchance)) {
      say(response);
    }
  });
}

// Kick on join
app.event("member_joined_channel", async ({ event, client }) => {
  const { user, channel } = event;

  for (const entry of kickOnJoin) {
    const { userMatch, channelMatch } = entry;

    if (channel === channelMatch && user === userMatch) {
      client.conversations.kick({
        channel,
        user,
      });
    }
  }
});

app.event("message", async ({ event, client }) => {
  const { text, ts, channel, user } = event;

  for (const entry of emojiReponses) {
    const { pattern, emojis } = entry;

    if (text && text.match(pattern)) {
      await client.reactions.add({
        name: emojis[Math.floor(Math.random() * emojis.length)],
        timestamp: ts,
        channel,
        channel,
      });
    }
  }

  for (const entry of respondToUserInChannel) {
    const { channelMatch, userMatch, response, perchance } = entry;

    if (user === userMatch && channel === channelMatch && dieRoll(perchance)) {
      client.chat.postMessage({
        channel,
        text: response,
      });
    }
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 8124);

  console.log("⚡️ Bolt app is running!");
})();
