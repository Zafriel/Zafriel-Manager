const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
const Guild = require("../../database/Schemas/Guild");
const User = require("../../database/Schemas/User");

exports.run = async (client, message, args) => {
  moment.locale("pt-BR");
  Guild.findOne({ _id: message.guild.id }, async function (err, server) {
    User.findOne({ _id: message.author.id }, async function (err, user) {
      if (!server.cmd.find((x) => x.name == args[0].toLowerCase())) {
        return message.quote(
          `${message.author}, não achei nenhum comando com o nome **\`${args[0]}\`**`
        );
      } else {
        const cmd = server.cmd.find((x) => x.name == args[0].toLowerCase());
        let author = await client.users.fetch(cmd.author);

        const CMD = new Discord.MessageEmbed()
          .setColor(process.env.EMBED_COLOR)
          .addFields(
            {
              name: "Nome do Comando",
              value: cmd.name,
            },
            {
              name: `Comando:`,
              value: `\`\`\`${cmd.desc}\`\`\``,
            },
            {
              name: "Enviado por",
              value: author.tag,
            },
            {
              name: "Enviado em",
              value: moment(cmd.date).format("LLL"),
            }
          );
        message.channel.send(CMD);
      }
    });
  });
};
exports.help = {
  name: "cmd",
  aliases: [],
};
