const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
const Guild = require("../../database/Schemas/Guild");
const User = require("../../database/Schemas/User");

exports.run = async (client, message, args) => {
  moment.locale("pt-BR");
  const EMBED = new Discord.MessageEmbed().setColor(process.env.EMBED_COLOR);
  const horas = moment(message.createdAt).format("LLLL");

  User.findOne({ _id: message.author.id }, async function (err, user) {
    message.quote(
      `${message.author}, caso queria enviar um pedido de parceria basta digitar: **\`CONFIRMAR\`**.`
    );
    await message.channel
      .awaitMessages(
        (m) =>
          m.author.id === message.author.id &&
          m.content.toLocaleLowerCase() === "confirmar",
        {
          max: 1,
          time: 20000,
          errors: ["time"],
        }
      )
      .catch((err) => {
        return message.quote(`tempo acabado`);
      });

    message.quote(`${message.author}, pedido de parceria enviado com sucesso!`);
    client.channels.cache
      .get("751976777303195650")
      .send(
        EMBED.setAuthor(
          `Novo pedido de Parceria dê: ${message.author.tag}`,
          message.author.displayAvatarURL({ dynamic: true })
        ).setDescription(`Solicitação de parceria enviada às: **${horas}**`)
      );
  });
};
exports.help = {
  name: "parceria",
  aliases: ["partner"],
  category: "Utils"
};
