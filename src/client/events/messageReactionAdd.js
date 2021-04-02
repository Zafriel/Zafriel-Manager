const { MessageEmbed } = require("discord.js");

module.exports = async (client, reaction, user) => {
  try {
    const handleStarboard = async () => {
      const starboard = client.channels.cache.find(
        (channel) => channel.name.toLowerCase() === "starboard"
      );
      const msgs = await starboard.messages.fetch({ limit: 100 });
      const existingMsg = msgs.find((msg) =>
        msg.embeds.length === 1
          ? msg.embeds[0].footer.text.startsWith(reaction.message.id)
            ? true
            : false
          : false
      );

      if (existingMsg) existingMsg.edit(`${reaction.count} ⭐`);
      else {
        const EMBED = new MessageEmbed()
          .setAuthor(
            reaction.message.author.tag,
            reaction.message.author.displayAvatarURL()
          )
          .setFooter(reaction.message.id)
          .setThumbnail(
            reaction.message.author.displayAvatarURL({
              format: "jpg",
              dynamic: true,
              size: 2048,
            })
          )
          .setDescription(
            `[Mensagem](${reaction.message.url})\n\n${reaction.message.content}`
          )
          .setColor(process.env.EMBED_COLOR)
          .setTimestamp();
        if (starboard) starboard.send(`1 ⭐`, EMBED);
      }
    };

    if (reaction.emoji.name === "⭐") {
      if (reaction.message.channel.name.toLowerCase() === "starboard") return;
      if (reaction.message.partial) {
        await reaction.fetch();
        await reaction.message.fetch();
        handleStarboard();
      } else {
        handleStarboard();
      }
    }
  } catch (err) {
    if (err) console.error(err);
  }
};
