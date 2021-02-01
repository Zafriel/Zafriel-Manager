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
    message.channel
      .send(
        `${message.author}, caso queria enviar um pedido de parceria basta digitar: **\`CONFIRMAR\`**.\n\n> Caso queira cancelar o pedido use **\`CANCELAR\`**`
      )
      .then(async (msg) => {
        let collector = msg.channel.createMessageCollector(
          (m) => m.author.id === message.author.id,
          { max: 1, time: 600000 }
        );

        collector.on("collect", async (collected) => {
          if (
            ["cancelar", "cancel"].includes(collected.content.toLowerCase())
          ) {
            message.channel.send(
              `${message.author}, ação cancelada com sucesso.`
            );

            return collector.stop();
          }

          if (["confirmar"].includes(collected.content.toLowerCase())) {
            message.quote(
              `${message.author}, pedido de parceria enviado com sucesso!`
            );
            client.channels.cache
              .get("751976777303195650")
              .send(
                EMBED.setAuthor(
                  `Novo pedido de Parceria dê: ${message.author.tag}`,
                  message.author.displayAvatarURL({ dynamic: true })
                ).setDescription(
                  `Solicitação de parceria enviada às: **${horas}**`
                )
              );
          }
        });
      });
  });
};
exports.help = {
  name: "parceria",
  aliases: ["partner"],
  category: "Utils",
  description: "Use este comando para requisitar um pedido de parceria",
  usage: "parceria",
};
