const { App } = require("@slack/bolt");
const { initSpellmoji, addWordAsReactions } = require("./spellmoji");
const initThanos = require("./thanos");
const { dieRoll, channels, members } = require("./utils");
const {
  reactionsByPattern,
  respondToPattern,
  respondToUserInChannel,
  kickOnJoin,
} = require("./config");

const DEFAULT_COOLDOWN_SECONDS = 600; // 10 minutes
const SHORT_MESSAGE_THRESHHOLD =   5; // 5 characters or less

const responseOnCooldownUntil = new Map();

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

// Respond to a message that matches a given pattern
for (const entry of respondToPattern) {
  const {
    pattern,
    response,
    perchance,
    cooldown = DEFAULT_COOLDOWN_SECONDS,
    quoteMatchedPortion,
  } = entry;
  app.message(pattern, async ({message, say, context}) => {
    const onCDUntil = responseOnCooldownUntil.get(pattern);
    if (onCDUntil) {
      console.log(`reponse to pattern ${pattern} is on CD until: ${onCDUntil}`);
    }

    if (dieRoll(perchance) && (!onCDUntil || Date.now() >= onCDUntil)) {
      responseOnCooldownUntil.set(
        pattern,
            
        new Date(Date.now() + cooldown * 1000)
      );

      let text = '';
      if (quoteMatchedPortion) {
        text = `> ${context.matches[0]}\n`;
      } 

      text = `${text}${response}`;

      const payload = {
        text: response,
        blocks: [{
          type: "section",
          text: {
            type: "mrkdwn",
            text
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              // text: `This response is on cooldown for ${cooldown} seconds. So don't try to spam it <@${members.alex}>.`
              text: `This response is on cooldown for ${cooldown} seconds. So don't try to spam it (Alex!)`
            }
          ]
        }
      ]
      };

      // use the existence of `thread_ts` to determine if this message was
      // in a thread. But if it is, use the `ts` as the `thread_ts` (unsure exactly why)
      // ref: https://github.com/slackapi/bolt-js/issues/559
      if (message.thread_ts) {
        payload.thread_ts = message.ts;
      }

      say(payload);
    }
  });
}

// Kick given user when they join given channel
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

// Join newly created channels
app.event("channel_created", async ({ event, client }) => {
  const { channel } = event;

  await client.conversations.join({ channel: channel.id });

  client.chat.postMessage({
    channel: channel.id,
    text: ":shifty:",
  });
});

app.event("message", async ({ event, client }) => {
  const { text, ts: timestamp, channel, user } = event;

  // addWordAsReaction to short messages
  if (text && text.length <= SHORT_MESSAGE_THRESHHOLD && dieRoll(10)) {
    addWordAsReactions({
      client,
      word: text,
      channel,
      timestamp,
    });
  }

  // add reaction to matching patterns
  for (const entry of reactionsByPattern) {
    const { pattern, reactions } = entry;

    if (text && text.match(pattern)) {
      const reactionsToAdd =
        reactions[Math.floor(Math.random() * reactions.length)];

      for (const name of reactionsToAdd) {
        await client.reactions.add({
          name,
          timestamp,
          channel,
        });
      }
    }
  }

  // respond to a given user when they post in a given channel
  for (const entry of respondToUserInChannel) {
    const { channelMatch, userMatch, response, perchance } = entry;

    if (
      user === userMatch &&
      (channel === channelMatch || channelMatch === channels.all) &&
      dieRoll(perchance)
    ) {
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

  console.log("⚡️ Bolt app is running! v1.2");
})();
