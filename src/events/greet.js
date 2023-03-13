const { Events } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();

const { GREETING_CHANNEL_ID } = process.env;

function sendGreeting(client) {
  const channel = client.channels.cache.get(GREETING_CHANNEL_ID);
  if (!channel) return console.error("Channel not found!");

  channel.send(
    "Bonjour Tout le Monde ! 👋 Je vous souhaite une bonne journée et un bon code !"
  );
}

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`👋 Greeting event registered !`);
    const hour = 7;
    const minute = 0;
    const second = 0;

    const currentTime = new Date();
    let targetTime = new Date();
    targetTime.setHours(hour, minute, second, 0);

    if (currentTime.getTime() > targetTime.getTime()) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const timeUntilTarget = targetTime.getTime() - currentTime.getTime();
    console.log(`⏱️Next greet in ${timeUntilTarget / 1000} seconds...`);
    setTimeout(() => {
      sendGreeting(client);
      setInterval(sendGreeting, 24 * 60 * 60 * 1000); // 24 hours interval
    }, timeUntilTarget);
  },
};
