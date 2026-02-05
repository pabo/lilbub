import { members, membersById, getRandomItemFromArray } from "./utils.js";

// TODO: change 8125 back to 8124 in 3 places in slack admin cp web ui
// - Interactivity + Shortcuts
// - Event subscriptions
// - Slash Commands (can leave 8125 until its actually a live feature)

const NUMBER_OF_REACTIONS_TO_SHOW = 5;
const DEFAULT_AVATAR_PHOTO_URL =
  "https://ca.slack-edge.com/T012GTVBUJX-USLACKBOT-sv41d8cd98f0-512";
const QUIZ_TIMER_DURATION_MS = 5000; // 5 seconds
const MINIMUM_VOTES_FOR_AUTO_REVEAL = 4;

const ongoingVotes = new Map();

const generateSectionsPayload = (reactions) => {
  // {
  //     "type": "section",
  //     "text": {
  //         "type": "plain_text",
  //         "text": "This is a plain text section block.",
  //         "emoji": true
  //     }
  // },

  return reactions
    .slice(0, NUMBER_OF_REACTIONS_TO_SHOW)
    .map(([name, count]) => {
      return {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:${name}:: ${count}`,
        },
      };
    });
};

// Helper function to update or add a vote
const updateVote = (votes, voterId, guessedUserId) => {
  const existingVoteIndex = votes.findIndex((v) => v.voterId === voterId);
  if (existingVoteIndex >= 0) {
    votes[existingVoteIndex].guessedUserId = guessedUserId;
  } else {
    votes.push({ voterId, guessedUserId });
  }
  return votes;
};

// Helper function to build reveal blocks
const buildRevealBlocks = async (
  client,
  correctAnswer,
  votes,
  gameHeaderBlock,
  questionHeaderBlock,
  reactionBlocks
) => {
  const correctUserInfo = await client.users.info({ user: correctAnswer });
  const correctUserPhotoUrl =
    correctUserInfo.user.profile?.image_512 ?? DEFAULT_AVATAR_PHOTO_URL;
  const correctUserName = membersById[correctAnswer] || "Unknown";

  // Find all correct guessers
  const correctGuessers = votes.filter((v) => v.guessedUserId === correctAnswer);

  // Build congratulatory message
  let congratsText = "";
  if (correctGuessers.length > 0) {
    const guesserNames = correctGuessers.map((v) => `<@${v.voterId}>`).join(", ");
    congratsText = `🎉 Congratulations to ${guesserNames} for guessing correctly!`;
  } else {
    congratsText = "😅 No one guessed correctly this time!";
  }

  // Rebuild vote blocks from votes array with correct/incorrect indicators
  const highlightedVoteBlocks = await Promise.all(
    votes.map(async (vote) => {
      const isCorrect = vote.guessedUserId === correctAnswer;
      const indicator = isCorrect ? "✅" : "❌";

      // Fetch user info to get actual profile photos
      const [voterInfo, guessedInfo] = await Promise.all([
        client.users.info({ user: vote.voterId }),
        client.users.info({ user: vote.guessedUserId }),
      ]);

      const voterPhotoUrl =
        voterInfo.user.profile?.image_32 ?? DEFAULT_AVATAR_PHOTO_URL;
      const guessedPhotoUrl =
        guessedInfo.user.profile?.image_32 ?? DEFAULT_AVATAR_PHOTO_URL;

      return {
        type: "context",
        elements: [
          {
            type: "plain_text",
            text: indicator,
          },
          {
            type: "image",
            image_url: voterPhotoUrl,
            alt_text: `${membersById[vote.voterId]}'s photo`,
          },
          {
            type: "plain_text",
            text: `${membersById[vote.voterId]} thinks it was `,
          },
          {
            type: "image",
            image_url: guessedPhotoUrl,
            alt_text: `${membersById[vote.guessedUserId]}'s photo`,
          },
          {
            type: "plain_text",
            text: `${membersById[vote.guessedUserId]}`,
          },
        ],
      };
    })
  );

  // Remove the accessory (user select dropdown) from question header block
  const questionHeaderWithoutDropdown = {
    type: "section",
    text: questionHeaderBlock.text,
  };

  return [
    gameHeaderBlock,
    questionHeaderWithoutDropdown,
    ...reactionBlocks,
    {
      type: "divider",
    },
    ...highlightedVoteBlocks,
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `✨ *The answer was:* <@${correctAnswer}>`,
      },
    },
    {
      type: "image",
      image_url: correctUserPhotoUrl,
      alt_text: `${correctUserName}'s photo`,
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: congratsText,
      },
    },
  ];
};

// Reveal the answer (shared by timer and button)
const revealAnswer = async (client, voteData) => {
  if (voteData.revealed) {
    return; // Already revealed
  }

  // Clear timer if it exists
  if (voteData.timer) {
    clearTimeout(voteData.timer);
  }

  // Get the game header block (first block - "Let's play the reactions game!")
  const gameHeaderBlock = voteData.initialBlocks[0];
  
  // Get the question header block (second block - "Whose reaction history is this?")
  const questionHeaderBlock = voteData.initialBlocks[1];
  
  // Get reaction blocks
  const reactionBlocks = voteData.initialBlocks.slice(2, 2 + NUMBER_OF_REACTIONS_TO_SHOW);

  const revealBlocks = await buildRevealBlocks(
    client,
    voteData.correctAnswer,
    voteData.votes,
    gameHeaderBlock,
    questionHeaderBlock,
    reactionBlocks
  );

  await client.chat.update({
    channel: voteData.channel,
    ts: voteData.ts,
    blocks: revealBlocks,
  });

  // Mark as revealed
  voteData.revealed = true;
  voteData.blocks = revealBlocks;
  ongoingVotes.set(voteData.ts, voteData);
};

// Add reveal button to message
const addRevealButton = async (client, voteData) => {
  const buttonBlock = {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "🔍 Reveal Answer",
          emoji: true,
        },
        action_id: "reactionQuiz-reveal-action",
        style: "primary",
      },
    ],
  };

  const newBlocks = [...voteData.blocks, buttonBlock];

  await client.chat.update({
    channel: voteData.channel,
    ts: voteData.ts,
    blocks: newBlocks,
  });

  voteData.blocks = newBlocks;
  ongoingVotes.set(voteData.ts, voteData);
};

// Timer callback function
const handleTimerExpiry = async (client, messageTs) => {
  const voteData = ongoingVotes.get(messageTs);
  if (!voteData || voteData.revealed) {
    return;
  }

  if (voteData.votes.length >= MINIMUM_VOTES_FOR_AUTO_REVEAL) {
    // Auto-reveal
    await revealAnswer(client, voteData);
  } else {
    // Add reveal button
    await addRevealButton(client, voteData);
  }
};

export const initReactionQuiz = (app) => {
  app.command(
    "/reactions",
    async ({ say, command, ack, body, respond, client, logger }) => {
      await ack();

      const reactions = new Map();
      let randomMemberId;

      while (reactions.size === 0) {
        //   randomMemberId = members.brett;
        randomMemberId = getRandomItemFromArray(Object.keys(membersById));

        console.log(`getting emojis for member ${membersById[randomMemberId]}`);

        const response = await client.reactions.list({
          user: randomMemberId,
        });

        response.items
          .filter((item) => item.message) // as opposed to file, comment, etc
          .forEach((item) => {
            return item.message.reactions
              .filter((r) => {
                return r.users.includes(randomMemberId);
              })
              .forEach((r) => {
                const count = reactions.get(r.name) ?? 0;
                reactions.set(r.name, count + 1);
              });
          });
      }

      const sortedReactions = [...reactions.entries()].sort(
        (a, b) => b[1] - a[1]
      );

      const blocks = [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "Let's play the reactions game!",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Whose reaction history is this?",
          },
          accessory: {
            type: "users_select",
            placeholder: {
              type: "plain_text",
              text: "Select a user",
              emoji: true,
            },
            action_id: "reactionQuiz-guess-action",
          },
        },
        ...generateSectionsPayload(sortedReactions),
        {
          type: "divider",
        },
      ];

      const postMessageResponse = await client.chat.postMessage({
        channel: command.channel_id,
        text: "test text",
        blocks,
      });

      // Set up timer for auto-reveal or button
      const timer = setTimeout(() => {
        handleTimerExpiry(client, postMessageResponse.ts);
      }, QUIZ_TIMER_DURATION_MS);

      ongoingVotes.set(postMessageResponse.ts, {
        ts: postMessageResponse.ts,
        channel: postMessageResponse.channel,
        blocks,
        initialBlocks: blocks, // Store the initial blocks separately
        correctAnswer: randomMemberId,
        votes: [],
        timer,
        revealed: false,
      });
    }
  );

  app.action(
    "reactionQuiz-guess-action",
    async ({ body, payload, action, client, ack, say, respond }) => {
      // Acknowledge action request
      await ack();

      const userWhoDidAction = body.user.id;
      const channel = body.channel.id;
      const messageTs = body.message.ts;
      const selectedUser = payload.selected_user;

      const thisVote = ongoingVotes.get(messageTs);

      // Don't allow voting if already revealed
      if (!thisVote || thisVote.revealed) {
        return;
      }

      const [selectedUserInfo, actingUserInfo] = await Promise.all([
        client.users.info({ user: selectedUser }),
        client.users.info({ user: userWhoDidAction }),
      ]);

      console.log("selectedUserInfo", selectedUserInfo);
      const actingUserPhotoUrl =
        actingUserInfo.user.profile?.image_32 ?? DEFAULT_AVATAR_PHOTO_URL;
      const selectedUserPhotoUrl =
        selectedUserInfo.user.profile?.image_32 ?? DEFAULT_AVATAR_PHOTO_URL;

      // Update or add vote
      updateVote(thisVote.votes, userWhoDidAction, selectedUser);

      // Get the initial blocks from the stored initialBlocks (not from current blocks which may have votes)
      const initialBlocks = thisVote.initialBlocks;

      // Check if there's a reveal button in the current blocks
      const revealButton = thisVote.blocks.find((block) => block.type === "actions");

      // Rebuild all vote blocks from the votes array to avoid duplicates
      const voteBlocks = thisVote.votes.map((vote) => {
        // We need to fetch user info for each vote to display properly
        // For now, use cached info if it's the current voter, otherwise use stored data
        const isCurrentVoter = vote.voterId === userWhoDidAction;
        const isCurrentGuess = vote.guessedUserId === selectedUser;

        return {
          type: "context",
          elements: [
            {
              type: "image",
              image_url:
                isCurrentVoter
                  ? actingUserPhotoUrl
                  : `https://ca.slack-edge.com/T012GTVBUJX-${vote.voterId}-sv41d8cd98f0-32`,
              alt_text: `${membersById[vote.voterId]}'s photo`,
            },
            {
              type: "plain_text",
              text: `${membersById[vote.voterId]} thinks it was `,
            },
            {
              type: "image",
              image_url:
                isCurrentVoter && isCurrentGuess
                  ? selectedUserPhotoUrl
                  : `https://ca.slack-edge.com/T012GTVBUJX-${vote.guessedUserId}-sv41d8cd98f0-32`,
              alt_text: `${membersById[vote.guessedUserId]}'s photo`,
            },
            {
              type: "plain_text",
              text: `${membersById[vote.guessedUserId]}`,
            },
          ],
        };
      });

      // Build new blocks, preserving reveal button if it exists
      const newBlocks = revealButton
        ? [...initialBlocks, ...voteBlocks, revealButton]
        : [...initialBlocks, ...voteBlocks];

      client.chat.update({
        channel: thisVote.channel,
        ts: thisVote.ts,
        blocks: newBlocks,
      });

      ongoingVotes.set(thisVote.ts, {
        ...thisVote,
        blocks: newBlocks,
      });
    }
  );

  // Handle reveal button click
  app.action(
    "reactionQuiz-reveal-action",
    async ({ body, client, ack }) => {
      await ack();

      const messageTs = body.message.ts;
      const voteData = ongoingVotes.get(messageTs);

      if (voteData && !voteData.revealed) {
        await revealAnswer(client, voteData);
      }
    }
  );
};
