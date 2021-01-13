const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
const Guild = require("../../database/Schemas/Guild");
const User = require("../../database/Schemas/User");

exports.run = async (client, message, args) => {
  moment.locale("pt-BR");
  Guild.findOne({ _id: message.guild.id }, async function (err, server) {
    User.findOne({ _id: message.author.id }, async function (err, user) {
      if (!args[0]) {
        return message.quote(
          `${message.author}, você deve inserir o nome do comando que deseja enviar.`
        );
      } else if (server.cmd.find((x) => x.name == args[0].toLowerCase())) {
        return message.quote(
          `${message.author}, já há um comando com esse nome.`
        );
      } else if (!args[1]) {
        return message.quote(
          `${message.author}, você deve inserir o comando que deseja enviar. **( SEM CODE-BLOCK )**`
        );
      } else {
        message.quote(`${message.author}, ok, enviei o comando com sucesso.`);
      }

      await Guild.findOneAndUpdate(
        { _id: message.guild.id },
        {
          $push: {
            cmd: [
              {
                name: args[0],
                desc: args.slice(1).join(" "),
                author: message.author.id,
                date: Date.now(),
              },
            ],
          },
        }
      );
    });
  });
};
exports.help = {
  name: "addcmd",
  aliases: [],
};
