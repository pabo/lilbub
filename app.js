// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});


// Slackbot++
const entries = [
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

const entries2 = [
    {
        channel: 'C03RTAMR2L', // #chan-gets-
        response: "no, you're a gay",
        perchance: 100,
    },
    {
        pattern: /gay/i,
        response: "I don't know how to tell my parents that I'm gay",
        perchance: 1,
    },
];

for (const entry of entries) {
  const {pattern, response, perchance} = entry;
  app.message(pattern, async ({ message, say }) => {
    
    const d100roll = Math.random() * 100; 
    
    console.log(`d100roll for pattern ${pattern} was ${d100roll}`);
    
    if (d100roll <= perchance) {
      await say(response);
    } 
  });
}

// Kick on join
app.event('member_joined_channel', async ({ event, client, context }) => {
    const {
    user,
    channel
  } = event;
  
  // @hanam, #tv-and-movies-no-hanams-allowed
  if (channel === 'C03TS27AN2H' && user === 'U012MRK5RJR') {
    client.conversations.kick({
      channel,
      user
    });
  }

  // @brett, #testing-new-channel
  if (channel === 'C03TPEWN2MC' && user === 'U012FAHGTB7') {
    client.conversations.kick({
      channel,
      user
    });
  }
})


const gayEmojis = [
  "gayseal",
  "le-gay",
  "gaycurious",
  "fabulously-gay"
];

app.event('message', async ({ event, client, context }) => {
  console.log("event", event);
  // console.log("client", client);
  // console.log("context", context);
  
  const {
    ts,
    message,
    channel,
    user
  } = event;
  
  
  // gay emojis
  if (event && event.text && event.text.match(/gay/)) {
    await client.reactions.add({
      name: gayEmojis[Math.floor(Math.random()*gayEmojis.length)],
      timestamp: ts,
      channel, channel
    })
  }
  
  // #chan-gets-a-job, @chan
  if (channel === 'C03RTAMR2L' && user === 'U0136UH7V3J') {
    const d100roll = Math.random() * 100; 
    
    console.log(`d100roll was ${d100roll}`);
    
    if (d100roll <= 5) {
      client.chat.postMessage({
        channel,
        text: "get a job"
      })
    } 
  }
  
});


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
