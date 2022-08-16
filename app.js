// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

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
  
  if (event.text.match(/ gay /)) {
    await client.reactions.add({
      name: gayEmojis[Math.floor(Math.random()*gayEmojis.length)],
      timestamp: ts,
      channel, channel
    })
  }
});

app.message(/gay/, async ({ message, say }) => {
  const d100roll = Math.random() * 100; 
  console.log("d100roll was", d100roll);
  if (d100roll === 1) {    
    await say("I don't know how to tell my parents that I'm gay");
  } 
});

app.message(/[uU]r[au]gu?ay/i, async ({ message, say }) => {
    await say("No, you're a gay.");
});

app.event('app_home_opened', async ({ event, client, context }) => {
  try {
    /* view.publish is the method that your app uses to push a view to the Home tab */
    const result = await client.views.publish({

      /* the user that opened your app's app home */
      user_id: event.user,

      /* the view object that appears in the app home*/
      view: {
        type: 'home',
        callback_id: 'home_view',

        /* body of the view */
        blocks: [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Welcome to your _App's Home_* :tada:"
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Heya This button won't do much for now but you can set up a listener for it using the `actions()` method and passing its unique `action_id`. See an example in the `examples` folder within your Bolt app."
            }
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "Click me!"
                }
              }
            ]
          }
        ]
      }
    });
  }
  catch (error) {
    console.error(error);
  }
});



(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
