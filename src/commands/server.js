const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Provides information about the server."),
  async execute(interaction) {
    await interaction.reply(
      `Ce serveur s'appelle ${interaction.guild.name} et comporte ${interaction.guild.memberCount} merveilleux !`
    );
  },
};
