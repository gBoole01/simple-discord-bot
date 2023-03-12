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

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`😺📰 Github Logger registered!`);
    setInterval(() => {
      getLatestCommits()
        .then((commits) => {
          if (commits.length > 0) {
            const channel = client.channels.cache.get(GITHUB_LOGGER_CHANNEL_ID);
            if (channel) {
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

              channel.send({ embeds: [embed] });
            }
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }, 60 * 60 * 1000);
  },
};
