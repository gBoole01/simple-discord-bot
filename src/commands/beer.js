const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("beer")
    .setDescription("Asks if anyone wants a beer after work."),
  async execute(interaction) {
    const pollEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Petite bière ?")
      .setDescription(
        "Qui est chaud pour descendre une pinte (ou deux) après le travail ?"
      )
      .addFields(
        {
          name: "Réagissez avec 🍻 pour montrer votre interêt",
          value: "\u200B",
        },
        {
          name: "Réagissez avec 🏡 si vous souhaitez simplement rentrer chez vous",
          value: "\u200B",
        },
        {
          name: "Alors ?\t🍻\tou\t🏡\t?",
          value: "\u200B",
        }
      )
      .setTimestamp();

    const sentMessage = await interaction.reply({
      embeds: [pollEmbed],
      fetchReply: true,
    });
    sentMessage.react("🍻");
    sentMessage.react("🏡");
  },
};
