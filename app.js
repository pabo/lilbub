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
    console.log("d100roll was", d100roll);
    if (d100roll < percentChance) {    
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

//All the room in the world for your code
app.event('message', async ({ event, client, context }) => {
  // console.log("event", event);
  // console.log("client", client);
  // console.log("context", context);
  
  const {
    ts,
    message,
    channel
  } = event;
  
  if (event.text.match(/gay/)) {
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
