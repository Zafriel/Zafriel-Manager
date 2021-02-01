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
        `${message.author}, você deve inserir se deseja verificar um bot ou um comando.`
      );

    if (args[0].toLowerCase() == "cmd") {
      if (!args[1]) {
        return message.quote(
          `${message.author}, você deve inserir o nome do comando que o usuário enviou.`
        );
      } else if (!server.cmd.find((x) => x.name == args[1])) {
        return message.quote(
          `${message.author}, não há nenhuma solicitação de comando com este nome.`
        );
      } else if (server.cmd.find((x) => x.name == args[1]).verify) {
        return message.quote(
          `${message.author}, este comando já foi verificado por outro Staff.`
        );
      } else {
        message.quote(
          `${message.author}, você verificou com sucesso o comando **\`${args[1]}\`**.`
        );
        client.channels.cache
          .get("799636802364637194")
          .send(
            `<:online2:687577310278320142> o comando **\`${args[1]}\`** foi aceito com sucesso.`
          );

        let verify = [server.cmd.find((x) => x.name.toLowerCase() == args[1].toLowerCase())];

        await Guild.findOneAndUpdate(
          { _id: message.guild.id },
          {
            $pull: {
              cmd: server.cmd.find((x) => x.name.toLowerCase() == args[1].toLowerCase()),
            },
          }
        );

        verify.map(async (x) => {
          await Guild.findOneAndUpdate(
            { _id: message.guild.id },
            {
              $push: {
                cmd: [
                  {
                    name: x.name,
                    author: x.author,
                    date: x.date,
                    key: x.key,
                    url: x.url,
                    verify: true,
                  },
                ],
              },
            }
          );
        });
      }
      return;
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
        if (!user.addBot.haveSoli) {
          return message.channel.send(
            `${message.author}, este membro não tem uma solicitação de Bot ativa.`
          );
        } else {
          await client.users.fetch(user.addBot.idBot).then(async (x) => {
            client.channels.cache
              .get("791053992276393994")
              .send(
                `<:online2:687577310278320142> ${USER} seu Bot **\`${x.username}\`** foi aceito pelo Staff **${message.author}**.`
              );
            await User.findOneAndUpdate(
              { _id: USER.id },
              {
                $set: {
                  "addBot.haveSoli": true,
                  "addBot.haveBot": true,
                  "addBot.acceptBy": message.author.tag,
                  "addBot.acceptIn": Date.now(),
                },
              }
            );
            message.channel.send(`${message.author}, bot aceito com sucesso!`);
            USER.roles.add(process.env.DEV_ROLE);
          });
        }
      });
      return;
    }
  });
};

exports.help = {
  name: "aceitar",
  aliases: [],
  category: "Staff",
  description: "Use este comando para aceitar um Bot/Comando",
  usage: "aceitar <cmd/bot> <id>",
};
