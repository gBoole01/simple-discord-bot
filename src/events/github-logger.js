const { Events, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();
const {
  GITHUB_REPOSITORY_OWNER,
  GITHUB_REPOSITORY_NAME,
  GITHUB_LOGGER_CHANNEL_ID,
} = process.env;

async function getLatestCommits() {
  const url = `https://api.github.com/repos/${GITHUB_REPOSITORY_OWNER}/${GITHUB_REPOSITORY_NAME}/commits?per_page=5`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GitHub API returned status code ${response.status}`);
  }

  const data = await response.json();
  return data;
}

function createMessage(commits) {
  if (commits.length === 0) return;

  const embed = new EmbedBuilder()
    .setColor("#0000ff")
    .setTitle("Latest commits on GitHub repository")
    .setURL(
      `https://github.com/${GITHUB_REPOSITORY_OWNER}/${GITHUB_REPOSITORY_NAME}`
    )
    .setDescription(
      commits
        .map((commit) => {
          const commitUrl = commit.html_url;
          const commitAuthor = commit.commit.author.name;
          const commitMessage = commit.commit.message;
          return `➡️ **${commitAuthor}** - ${commitMessage} (<${commitUrl}>)\n\n`;
        })
        .join("")
    );

  return embed;
}

function log(client) {
  const now = new Date();
  if (now.getDay() === 6 || now.getDay() === 0) return;

  const channel = client.channels.cache.get(GITHUB_LOGGER_CHANNEL_ID);
  if (!channel) return console.error("Channel not found!");

  getLatestCommits()
    .then((commits) => {
      const message = createMessage(commits);
      channel.send({ embeds: [message] });
    })
    .catch((err) => console.error(err));
}

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`😺📰 Github Logger registered!`);
    const hour = 7;
    const minute = 0;
    const second = 0;

    const currentTime = new Date();
    let targetTime = new Date();
    targetTime.setHours(hour, minute, second, 0);

    if (currentTime.getTime() > targetTime.getTime()) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    while (targetTime.getDay() === 6 || targetTime.getDay() === 0) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const timeUntilTarget = targetTime.getTime() - currentTime.getTime();
    console.log(
      `⏱Next github log entry in ${timeUntilTarget / 1000} seconds...`
    );
    setTimeout(() => {
      log(client);
      setInterval(log, 24 * 60 * 60 * 1000); // 24 hours interval
    }, timeUntilTarget);
  },
};
