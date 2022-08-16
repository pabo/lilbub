// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});


const entries = [
    {
        pattern: /ur[au]gu?ay/i,
        response: "no, you're a gay",
        percentChance: 100,
    },
    {
        pattern: /gay/i,
        response: "I don't know how to tell my parents that I'm gay",
        percentChance: 1,
    },
    
];

for (const entry of entries) {
  const {pattern, response, percentChance} = entry;
  app.message(pattern, async ({ message, say }) => {
    const d100roll = Math.random() * 100; 
    console.log(`d100roll for pattern ${pattern} was ${d100roll}`);
    if (d100roll <= percentChance) {
      await say(response);
    } 
  });
}

const gayEmojis = [
  "gayseal",
  "le-gay",
  "gaycurious",
  "fabulously-gay"
];

app.event('member_joined_channel', async ({ event, client, context }) => {
  console.log("event", event);
  console.log("client", client);
  console.log("context", context);
    const {
    user,
    channel
  } = event;
  
  // hanam, tv-and-movies-no-hanams-allowed
  if (channel === 'C03TS27AN2H' && user === 'U012MRK5RJR') {
    client.conversations.kick({
      channel,
      user
    });
  }

})


app.event('message', async ({ event, client, context }) => {
  // console.log("event", event);
  // console.log("client", client);
  // console.log("context", context);
  
  const {
    ts,
    message,
    channel
  } = event;
  
  if (event && event.text && event.text.match(/gay/)) {
    await client.reactions.add({
      name: gayEmojis[Math.floor(Math.random()*gayEmojis.length)],
      timestamp: ts,
      channel, channel
    })
  }
});


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
