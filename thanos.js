const fs = require("fs");
const { membersById } = require('./utils');

const COUNTDOWN_IN_MINUTES = 5;
const ONE_MINUTE_IN_MS = 60000;

// When someone says "Thanos did nothing wrong", start a countdown to the snap.
// The snap will remove half of the users of a channel at random.
// To prevent the snap, we need a certain number of downvotes.
// TODO: more counting down
// TODO: early exit on success?

module.exports = (app) => {
  let snapMessageTs = null;
  let downvotesRequired = 0;
  let downvoteCount = 0;
  let snapChannel = null;
  let snappedMembers = [];
  let countdownMinutesRemaining = COUNTDOWN_IN_MINUTES;

  try {
    downvotesRequired = parseInt(
      fs.readFileSync("downvotesRequired.txt", "utf8"),
      10
    );
    console.log(downvotesRequired);
  } catch (err) {
    console.error(err);
  }

  const quotes = [
    "Dread it. Run from it. Destiny arrives all the same. And now it's here. Or should I say, I am.",
    "The hardest choices require the strongest wills.",
    "At random. Dispassionate, fair to rich and poor alike. They called me a mad man. And what I predicted came to pass.",
    "I am... inevitable.",
    "You're strong, but I could snap my fingers and you'd all cease to exist.",
    "What I'm about to do to your stubborn, annoying little planet, I'm gonna enjoy it, very, very much.",
    "Hear me and rejoice! You have had the privilege of being saved by the Great Titan. You may think this is suffering. No... it is salvation. The universal scales tip toward balance because of your sacrifice. Smile... for even in death, you have become children of Thanos.",
  ];
  let quoteCounter = 0;
  let randomQuotes = quotes;

  const getRandomQuote = () => {
    const quote = randomQuotes[quoteCounter];

    quoteCounter = (quoteCounter + 1) % randomQuotes.length;

    return quote;
  };

  const getPleaText =  () => {
    const snapSucceeding = downvoteCount < downvotesRequired;

    return snapSucceeding
        ? "Won't you help stop Thanos?"
        : "Hope no one changes their minds..."
  };
 
  const getDownvoteStatusText = () => {
    const snapSucceeding = downvoteCount < downvotesRequired;

    const downvotesText = downvoteCount
      ? `${snapSucceeding ? `` : ""} ${downvoteCount} downvotes`
      : "no downvotes yet";
   
    return `:downvote: ${downvotesText} (${downvotesRequired} required)`;
  };

  const getPostMessagePayload = () => {
    const text =
      "_This universe is finite, its resources, finite... if life is left unchecked, life will cease to exist._";
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "@here *React to this message with :downvote: to prevent The Snap.*",
        },
      },
      {
        "type": "section",
			  "fields": [
				  {
            type: "plain_text",
					  "text": `:clock1: ${countdownMinutesRemaining} minutes remaining`,
					  "emoji": true
				  },
				  {
            type: "plain_text",
					  "text": getDownvoteStatusText(),
					  "emoji": true
				  },
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: getPleaText(),
        },
      }
    ];

    return {
      blocks,
      text,
    };
  };

  app.event("message", async ({ event, client }) => {
    const { text, channel } = event;

    // initiate a snap
    if (!snapMessageTs && text && text.match(/thanos ?did ?nothing ?wrong/i)) {
      downvoteCount = 0;
      countdownMinutesRemaining = COUNTDOWN_IN_MINUTES;

      // This is NOT VERY RANDOM but its a stupid slackbot app so who cares. It's biased towards the existing order.
      randomQuotes = quotes.sort(() => 0.5 - Math.random());
      quoteCounter = 0;

      // every time we snap, it takes one more downvote to stop it
      downvotesRequired++;

      try {
        fs.writeFileSync("downvotesRequired.txt", `${downvotesRequired}`);
        // file written successfully
      } catch (err) {
        console.error(err);
      }

      // grab the set of members who will be snapped
      membersResult = await client.conversations.members({
        channel,
      });

      snappedMembers = (membersResult.members || []).filter(
        () => Math.random() > 0.5
      );
     
      const snappedMembersText = snappedMembers.map(m => {
        return membersById[m]
      });

      console.log("members who would be snapped:", snappedMembersText.join(", "));

      // create the snapMessage, informing channel of impending snap
      const result = await client.chat.postMessage({
        channel,
        ...getPostMessagePayload(),
      });

      // these keep track of the snap message
      snapMessageTs = result.ts;
      snapChannel = channel;

      // set up minute-ly updates
      const handle = setInterval(async () => {
        countdownMinutesRemaining--;

        // out of time
        if (countdownMinutesRemaining <= 0) {
          // stop the updates
          clearInterval(handle);

          // snap!
          if (downvoteCount < downvotesRequired) {
            client.chat.postMessage({
              channel,
              text: "Perfectly balanced, as all things should be.\n\nhttps://giphy.com/gifs/46F2QiR8sAX5ezp2pG",
              blocks: [
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: "_Perfectly balanced, as all things should be._\n\nhttps://giphy.com/gifs/46F2QiR8sAX5ezp2pG",
                  },
                },
              ],
            });

            for (const user of snappedMembers) {
              // dont kick lilbub
              if (user !== "U03TSKB0MJR") {
                try {
                  await client.conversations.kick({
                    channel,
                    user,
                  });
                } catch (e) {
                  /* bot failed to kick this set:
                    'U01220V5U0P', 'U012238MWJK',
                    'U0122BGBAPR', 'U012A4QRQTG',
                    'U012GNATCUA', 'U012LRFBZMY',
                    'U012N9HN1EZ', 'U013736LETS',
                    'U013B8WQD51', 'U013DD9RP6C',
                    'U01GR9QKNAY', 'U01L8PV7AF4',
                    'U03TSKB0MJR'
                   */
                  console.log(
                    `could not kick user ${user}, for reason ${e}`,
                    e
                  );
                }
              }
            }
          }
          // saved from snap
          else {
            client.chat.postMessage({
              channel,
              text: `I know what it's like to lose. To feel so desperately that you're right, yet to fail nonetheless. It's frightening, turns the legs to jelly.\n\nYou have merely delayed the inevitable with ${downvoteCount} downvotes. Congratulations. Until next time...`,
              blocks: [
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: `_I know what it's like to lose. To feel so desperately that you're right, yet to fail nonetheless. It's frightening, turns the legs to jelly._\n\nYou have merely delayed the inevitable with ${downvoteCount} downvotes. Congratulations. Until next time...`,
                  },
                },
              ],
            });
          }

          // reset snapTs, which means we can listen for another snap
          snapMessageTs = null;
        }
        // not out of time yet
        else {
          const quote = getRandomQuote();

          await client.chat.postMessage({
            channel,
            text: quote,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `_${quote}_`,
                },
              },
            ],
          });

          await client.chat.update({
            channel,
            ts: snapMessageTs,
            ...getPostMessagePayload(),
          });
        }
      }, ONE_MINUTE_IN_MS);
    }
  });

  app.event("reaction_added", async ({ event, client, context }) => {
    const { item, reaction } = event;
    const { ts, channel } = item;

    if (
      snapMessageTs &&
      snapMessageTs === ts &&
      snapChannel &&
      snapChannel === channel &&
      reaction &&
      reaction === "downvote"
    ) {
      downvoteCount++;
      console.log("downvotes:", downvoteCount);
      await client.chat.update({
        channel,
        ts: snapMessageTs,
        ...getPostMessagePayload(),
      });
    }
  });

  app.event("reaction_removed", async ({ event, client, context }) => {
    const { item, reaction } = event;
    const { ts, channel } = item;

    if (
      snapMessageTs &&
      snapMessageTs === ts &&
      snapChannel &&
      snapChannel === channel &&
      reaction &&
      reaction === "downvote"
    ) {
      downvoteCount--;
      console.log("downvotes:", downvoteCount);
      await client.chat.update({
        channel,
        ts: snapMessageTs,
        ...getPostMessagePayload(),
      });
    }
  });
};
