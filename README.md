# Lil Bub
[Lil Bub](https://en.wikipedia.org/wiki/Lil_Bub) is a slack bot built off the [Bolt framework](https://slack.dev/bolt-js/). It is basically a slackbot replacement with more configurability.

## Slackbot-like Features
### respondToPattern
Responds to a message that matches the given regex.

`pattern`: the regex to match
`reponse`: the response
`perchance`: percent chance of bot responding when the pattern is matched. 
`cooldown`: number of seconds to disable this response after responding
`quoteMatchedPortion`: whether to include the matched portion in the response

Example config:
```
{
    pattern: /\bi.[aeiou]a\b/gi,
    response: "I hear they make good meatballs",
    perchance: 100,
    cooldown: 3600,
    quoteMatchedPortion: true
},
```

### reactionsByPattern
Reacts to a message that matches the given regex.

`pattern`: the regex to match
`reactions`: an array of arrays. the bot will choose at random one of the outer array's elements, and then add all reactions in that inner array.

Example config:
```
  {
    pattern: /\bquote\b/i,
    reactions: [["airquotes", "airquotes-left"]],
  },
```

### respondToUserInChannel
Responds to any message posted by the given user in the given channel.

`channelMatch`: the channel to monitor
`userMatch`: the user to respond to
`response`: the response
`perchance`: the percent chance that this triggers

Example config: 
```
  {
    channelMatch: channels.all,
    userMatch: members.jed,
    response: "just saw this",
    perchance: 5,
  },
```

### kickOnJoin
Kicks someone as soon as they join a given channel

`userMatch`: the user to kick
`channelMatch`: the channel to kick them from

Example config:
```
  {
    userMatch: members.brett,
    channelMatch: channels["testing-new-channel"],
  },
```

### kickOnMention
Not actually implemented.... yet.

## Other Features

### Thanos
Whenever anyone says the key phrase `Thanos did nothing wrong`, initiate a countdown to a snap. During the countdown, users can vote whether they want the snap to succeed. If, at the end of the countdown, the snap succeeds, then every user in the channel has a 50% chance of being kicked from the channel.

### Spellmoji
A command available in each message's triple dot menu, spellmoji will react to the message with reactions that spell out a given word or phrase.