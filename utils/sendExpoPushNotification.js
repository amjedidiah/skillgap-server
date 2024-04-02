const { Expo } = require("expo-server-sdk");
const sendExpoPushNotification = async (pushToken, opponentData =  {}) => {
  // Create a new Expo SDK client

  let expo = new Expo();

  // Create the messages that you want to send to clients
  let messages = [];

  // validate  expo push token

  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    throw new Error(`Push token ${pushToken} is not a valid Expo tolen`);
  }

  messages.push({
    to: pushToken,
    sound: "default",
    body: "You have been invited for a  skill gap contest",
    title: "Skill Gap Contest",
    data: {
      contest: "You have been invited for a contest",
     opponentData
    },
  });

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  for (let chunk of chunks) {
    let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }
  console.log("notification done");
};

module.exports = sendExpoPushNotification;
