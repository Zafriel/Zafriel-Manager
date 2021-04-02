const Guild = require("../../database/Schemas/Guild");
const User = require("../../database/Schemas/User");
const GetMention = (id) => new RegExp(`^<@!?${id}>( |)$`);
const Client = require("../../database/Schemas/Client");

module.exports = async (client, message) => {
  try {
    if (message.channel.type == "dm") return;

    User.findOne({ _id: message.author.id }, async (err, user) => {
      Guild.findOne({ _id: message.guild.id }, async (err, server) => {
        Client.findOne({ _id: client.user.id }, async (err, bot) => {
          // if (message.author.bot == true) return;

          if (user) {
            if (server) {
              if (bot) {
                const prefix = server.prefix;

                if (message.channel.id == "751976772312104981") {
                  message.react("❤️");
                }

                let channels = ["751976772974674030", "820038871940071435"];

                if (channels.some((x) => x === message.channel.id)) {
                  if (message.author.id == "600804786492932101") return;
                  message.react("602287529806266378");
                  setTimeout(() => {
                    message.react("602283144837857280");
                  }, 1000);
                }

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
                  client.commands.get(
                    client.aliases.get(cmd.slice(prefix.length))
                  );

                if (cmdFile) {
                  return cmdFile.run(client, message, args);
                }
              } else {
                Client.create({ _id: client.user.id });
              }
            } else {
              Guild.create({ _id: message.guild.id });
            }
          } else {
            User.create({ _id: message.author.id });
          }
        });
      });
    });
  } catch (err) {
    if (err) console.error(err);
  }
};
