// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const users = {
  chan: 'U0136UH7V3J',
  hanam: 'U012MRK5RJR',
  brett: 'U012FAHGTB7',
}

const channels = {
  'testing-new-channel': 'C03TPEWN2MC',
  'tv-and-movies-no-hanams-allowed': 'C03TS27AN2H',
  'lil-bub-dev': 'C03TVR0JDC3'
}

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});


// Slackbot++
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
        channelMatch: 'C03RTAMR2L', // #chan-gets-a-job
        userMatch: 'U0136UH7V3J', // @chan
        response: "get a job",
        perchance: 5,
    },
];

const emojiReponses = [
  {
    pattern: /gay/,
    emojis: [
      "gayseal",
      "le-gay",
      "gaycurious",
      "fabulously-gay",
      "erik-pretty"
    ]
  }
];


const kickOnJoin = [
  {
    user: users.chan,
    channel: 'C03TS27AN2H'
  }
]

for (const entry of respondToPattern) {
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
  
  for (const entry of kickOnJoin) {
    const {user, channel} = entry;
    
      if (channel === channels['tv-and-movies-no-hanams-allowed'] && user === users.hanam) {
    client.conversations.kick({
      channel,
      user
    });
  }

  }
  
  if (channel === channels['tv-and-movies-no-hanams-allowed'] && user === users.hanam) {
    client.conversations.kick({
      channel,
      user
    });
  }

  if (channel === channels['testing-new-channel'] && user === users.brett) {
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
  // console.log("event", event);
  // console.log("client", client);
  // console.log("context", context);
  
  const {
    ts,
    message,
    channel,
    user
  } = event;
  
  
  
  for (const entry of emojiReponses) {
    const {pattern, emojis} = entry;
    
    if (event && event.text && event.text.match(pattern)) {
      await client.reactions.add({
        name: emojis[Math.floor(Math.random()*emojis.length)],
        timestamp: ts,
        channel, channel
      })
    }  
  }

  
  // per user/channel  
  for (const entry of respondToUserInChannel) {
    const {channelMatch, userMatch, response, perchance} = entry;
  

    if (user === userMatch && channel && channelMatch) {
      const d100roll = Math.random() * 100; 
      console.log(`d100roll for user ${user} channel ${channel} was ${d100roll}`);

      if (d100roll <= perchance) {
        client.chat.postMessage({
          channel,
          text: response
        })
      }
    }
  }

});


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
