const Guild = require("../../database/Schemas/Guild");
const User = require("../../database/Schemas/User");

exports.run = async (client, message, args) => {
  Guild.findOne({ _id: message.guild.id }, async function (err, server) {
    if (!server.staff.some((x) => x === message.author.id))
      return message.channel.send(
        `${message.author}, só Staff pode usar esse comando bobinho(a).`
      );

    if (!args[0])
      return message.channel.send(
        `${message.author}, você deve inserir se deseja remover um bot ou um comando.\n**${server.prefix}remover <cmd/bot>`
      );

    if (args[0].toLowerCase() == "cmd") {
      if (!args[1]) {
        return message.quote(
          `${message.author}, você deve inserir o nome do comando que deseja remover.`
        );
      } else if (!server.cmd.find((x) => x.name == args.slice(1).join(" "))) {
        return message.quote(
          `${message.author}, não há nenhum comando com este nome.`
        );
      } else {
        message.quote(
          `${
            message.author
          }, você excluiu com sucesso o comando **\`${args
            .slice(1)
            .join(" ")}\`**.`
        );

        await Guild.findOneAndUpdate(
          { _id: message.guild.id },
          {
            $pull: {
              cmd: server.cmd.find((x) => x.name == args.slice(1).join(" ")),
            },
          }
        );
      }
    }

    if (args[0].toLowerCase() == "bot") {
      let USER = message.guild.member(
        client.users.cache.get(args[1]) || message.mentions.members.first()
      );

      if (!USER)
        return message.channel.send(
          `${message.author}, você deve mencionar/inserir o ID do membro primeiro.`
        );

      User.findOne({ _id: USER.id }, async function (err, user) {
        if (!user.addBot.haveBot) {
          return message.channel.send(
            `${message.author}, este membro não possui um Bot no servidor.`
          );
        } else {
          await User.findOneAndUpdate(
            { _id: USER.id },
            {
              $set: {
                "addBot.haveSoli": false,
                "addBot.haveBot": false,
                "addBot.acceptBy": "null",
                "addBot.acceptIn": 0,
              },
            }
          );
          message.channel.send(`${message.author}, removi o bot com sucesso.`);
          USER.roles.remove(process.env.DEV_ROLE);
        }
      });
    }
  });
};

exports.help = {
  name: "remover",
  aliases: ["remove"],
  category: "Staff",
  description: "Use este comando para remover um bot de alguém membro;",
  usage: "remover <user>",
};
