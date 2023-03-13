const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Provides information about the user."),
  async execute(interaction) {
    await interaction.reply(
      `Cette commande a été utilisée par ${interaction.user.username}, il a rejoint le serveur le ${interaction.member.joinedAt}.`
    );
  },
};
