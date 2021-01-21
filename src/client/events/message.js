const Guild = require("../../database/Schemas/Guild");
const User = require("../../database/Schemas/User");
const Discord = require("discord.js");
const moment = require("moment");
const GetMention = (id) => new RegExp(`^<@!?${id}>( |)$`);

module.exports = async (client, message) => {
  try {
    User.findOne({ _id: message.author.id }, async function (err, user) {
      Guild.findOne({ _id: message.guild.id }, async function (err, server) {
        if (message.author.bot == true) return;

        if (!user.help) {
          if (
            message.content.includes("enviar") ||
            message.content.includes("bot") ||
            message.content.includes("enviar um bot") ||
            message.content.includes("mandar um bot") ||
            message.content.includes("como mando meu bot")
          ) {
            message.channel.startTyping();
            setTimeout(async (f) => {
              message.channel.send(
                `${message.author}, para enviar um bot para o servidor use: **${server.prefix}addbot**`
              );
              await User.findOneAndUpdate(
                { _id: message.author.id },
                { $set: { help: true } }
              );
              message.channel.stopTyping();
            }, 2000);
            setInterval(async (x) => {
              await User.findOneAndUpdate(
                { _id: message.author.id },
                { $set: { help: false } }
              );
            }, 60000 * 2);
          }
        }

        if (user) {
          if (server) {
            const prefix = server.prefix;

            if (message.content.match(GetMention(client.user.id))) {
              message.channel.send(
                `Olá ${message.author}, meu prefixo no servidor é **${prefix}**.\n\nPara saber meus comandos use **\`${prefix}help\`**`
              );
            }

            if (message.content.indexOf(prefix) !== 0) return;
            let messageArray = message.content.split(" ");
            let cmd = messageArray[0];
            let args = messageArray.slice(1);
            let cmdFile =
              client.commands.get(cmd.slice(prefix.length)) ||
              client.commands.get(client.aliases.get(cmd.slice(prefix.length)));

            if (cmdFile) {
              return cmdFile.run(client, message, args);
            }
          } else {
            Guild.create({ _id: message.guild.id });
          }
        } else {
          User.create({ _id: message.author.id });
        }

        
      });
    });
  } catch (err) {
    if (err) console.error(err);
  }
};
