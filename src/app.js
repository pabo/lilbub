import bolt from "@slack/bolt";
import packageJson from "../package.json" assert { type: "json" };
import { initSpellmoji, addWordAsReactions } from "./spellmoji.js";
import initThanos from "./thanos.js";
import { initReactionQuiz } from "./reactionQuiz.js";
import { dieRoll, channels, durationDisplayFromSeconds, getRandomItemFromArray } from "./utils.js";
import {
  reactionsByPattern,
  respondToPattern,
  respondToUserInChannel,
  kickOnJoin,
} from "./config.js";

const ONE_SECOND_IN_MS = 1000;
const DEFAULT_COOLDOWN_SECONDS = 600; // 10 minutes
const SHORT_MESSAGE_THRESHHOLD = 5; // 5 characters or less

const responseOnCooldownUntil = new Map();

console.log("process.env", process.env)
const app = new bolt.App({
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
initReactionQuiz(app);

// Respond to a message that matches a given pattern
for (const entry of respondToPattern) {
  const {
    pattern,
    response,
    perchance,
    cooldown = DEFAULT_COOLDOWN_SECONDS,
    quoteMatchedPortion,
  } = entry;
  app.message(pattern, async ({ message, say, context }) => {
    const onCDUntil = responseOnCooldownUntil.get(pattern);
    if (onCDUntil) {
      console.log(`reponse to pattern ${pattern} is on CD until: ${onCDUntil}`);
    }

    if (dieRoll(perchance) && (!onCDUntil || Date.now() >= onCDUntil)) {
      responseOnCooldownUntil.set(
        pattern,

        new Date(Date.now() + cooldown * ONE_SECOND_IN_MS)
      );

      let quoteText = "";
      if (quoteMatchedPortion) {
        quoteText = `> ${context.matches[0]}\n`;
      }

      const getPayload = ({ quoteText, response, cooldown }) => {
        const payload = {
          text: `${quoteText}${response}`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `${quoteText}${response}`,
              },
            },
         ],
        };

        if (cooldown > 0) {
          payload.blocks.push(
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `This response is on cooldown for ${durationDisplayFromSeconds(
                    cooldown
                  )}. So don't try to spam it (Alex!)`,
                },
              ],
            });
        }
 
        return payload;
      };

      const payload = getPayload({ quoteText, response, cooldown });
      let cooldownRemaining = cooldown;

      // use the existence of `thread_ts` to determine if this message was
      // in a thread. But if it is, use the `ts` as the `thread_ts` (unsure exactly why)
      // ref: https://github.com/slackapi/bolt-js/issues/559
      if (message.thread_ts) {
        payload.thread_ts = message.ts;
      }

      const { ts, channel } = await say(payload);

      const handler = setInterval(() => {
        cooldownRemaining -= 1;

        app.client.chat.update({
          channel,
          ts,
          ...getPayload({ quoteText, response, cooldown: cooldownRemaining }),
        });
      }, ONE_SECOND_IN_MS);

      setTimeout(() => {
        clearInterval(handler);
      }, (1+cooldown) * ONE_SECOND_IN_MS);
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
  const { text, ts: timestamp, channel, user, type, subtype, message } = event;

  // could detect subtype==="message_changed" instead...
  const textOfMessageOrUpdate = message?.text ?? text ?? "";
  const tsOfMessageOrUpdate = message?.ts ?? timestamp;

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

    if (textOfMessageOrUpdate && textOfMessageOrUpdate.match(pattern)) {
      const reactionsToAdd = getRandomItemFromArray(reactions);

      for (const name of reactionsToAdd) {
        await client.reactions.add({
          name,
          timestamp: tsOfMessageOrUpdate,
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

  console.log(`⚡️ Bolt app is running! ${packageJson.version}`);
})();
