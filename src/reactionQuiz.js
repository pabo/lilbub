import { members, membersById, getRandomItemFromArray } from "./utils.js";

// TODO: change 8125 back to 8124 in 3 places in slack admin cp web ui
// - Interactivity + Shortcuts
// - Event subscriptions
// - Slash Commands (can leave 8125 until its actually a live feature)

const NUMBER_OF_REACTIONS_TO_SHOW = 5;
const DEFAULT_AVATAR_PHOTO_URL =
  "https://ca.slack-edge.com/T012GTVBUJX-USLACKBOT-sv41d8cd98f0-512";

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
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "Votes will appear here",
            },
          ],
        },
      ];

      const postMessageResponse = await client.chat.postMessage({
        channel: command.channel_id,
        text: "test text",
        blocks,
      });

      ongoingVotes.set(postMessageResponse.ts, {
        ts: postMessageResponse.ts,
        channel: postMessageResponse.channel,
        blocks,
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

      const [selectedUserInfo, actingUserInfo] = await Promise.all([
        client.users.info({ user: selectedUser }),
        client.users.info({ user: userWhoDidAction }),
      ]);

      console.log("selectedUserInfo", selectedUserInfo);
      const actingUserPhotoUrl =
        actingUserInfo.user.profile?.image_32 ?? DEFAULT_AVATAR_PHOTO_URL;
      const selectedUserPhotoUrl =
        selectedUserInfo.user.profile?.image_32 ?? DEFAULT_AVATAR_PHOTO_URL;

      console;

      if (thisVote) {
        // text: `in ${channel} on the message with ts ${messageTs}, ${membersById[userWhoDidAction]} selected ${membersById[selectedUser]}`,
        const newBlocks = [
          ...thisVote.blocks,
          {
            type: "context",
            elements: [
              {
                type: "plain_text",
                text: `was it `,
              },
              {
                type: "image",
                image_url: selectedUserPhotoUrl,
                alt_text: `${membersById[selectedUser]}'s photo`,
              },
              {
                type: "plain_text",
                text: `${membersById[selectedUser]}? `,
              },
              {
                type: "image",
                image_url: actingUserPhotoUrl,
                alt_text: `${membersById[userWhoDidAction]}'s photo`,
              },
              {
                type: "plain_text",
                text: `${membersById[userWhoDidAction]} thinks it was.`,
              },
            ],
          },
        ];

        client.chat.update({
          channel: thisVote.channel,
          ts: thisVote.ts,
          blocks: newBlocks,
        });

        ongoingVotes.set(thisVote.ts, {
          ts: thisVote.ts,
          channel: thisVote.channel,
          blocks: newBlocks,
        });
      }
    }
  );
};
