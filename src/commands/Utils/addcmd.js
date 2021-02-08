const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
const Guild = require("../../database/Schemas/Guild");
const User = require("../../database/Schemas/User");
const sourcebin = require("sourcebin");

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
      } else if (!args.slice(1).join(" ")) {
        return message.quote(
          `${message.author}, você deve inserir o comando que deseja enviar. **( SEM CODE-BLOCK )**`
        );
      } else {
        message.channel
          .send(
            `${message.author}, deseja enviar o comando **${args[0]}** para avaliação?`
          )
          .then(async (msgReact) => {
            for (let emoji of ["✅", "❌"]) await msgReact.react(emoji);
            msgReact
              .awaitReactions(
                (reaction, user) =>
                  user.id == message.author.id &&
                  ["✅", "❌"].includes(reaction.emoji.name),
                { max: 1 }
              )
              .then(async (collected) => {
                if (collected.first().emoji.name == "✅") {
                  sourcebin
                    .create(
                      [
                        {
                          name: args[0],
                          content: args.slice(1).join(" "),
                          languageId: "text",
                        },
                      ],
                      {
                        title: args[0],
                        description: "Zafriel Manager - Comandos",
                      }
                    )
                    .then(async (x) => {
                      await Guild.findOneAndUpdate(
                        { _id: message.guild.id },
                        {
                          $push: {
                            cmd: [
                              {
                                name: args[0],
                                author: message.author.id,
                                date: Date.now(),
                                key: x.key,
                                url: x.url,
                                verify: false,
                              },
                            ],
                          },
                        }
                      );
                      const CmdAdd = new Discord.MessageEmbed()
                        .setColor(process.env.EMBED_COLOR)
                        .addFields(
                          {
                            name: "Author",
                            value: message.author.tag,
                          },
                          {
                            name: "ID",
                            value: message.author.id,
                          },
                          {
                            name: "Comando",
                            value: x.url,
                          },
                          {
                            name: "Comando enviado em",
                            value: moment(Date.now()).format("LLLL"),
                          }
                        )
                        .setFooter(
                          `Comando enviado por: ${message.author.tag}`,
                          message.author.avatarURL({ dynamic: true })
                        )
                        .setThumbnail(
                          message.author.avatarURL({ dynamic: true })
                        );

                      message.quote(
                        `${message.author}, ok, seu comando **${args[0]}** foi enviado para avaliação.`
                      );
                      client.channels.cache
                        .get("808364545444675625")
                        .send(
                          `<:idle:808350287806988348> ${message.author} enviou o comando **\`${args[0]}\`** para avaliação.`
                        );
                      client.channels.cache
                        .get("808364546535850065")
                        .send(CmdAdd);
                    })
                    .catch(console.error);
                  msgReact.delete();
                }
                if (collected.first().emoji.name == "❌") {
                  message.quote(
                    `${message.author}, ok, cancelei o envio do seu comando.`
                  );

                  msgReact.delete();
                }
              });
          });
      }
    });
  });
};
exports.help = {
  name: "addcmd",
  aliases: [],
  category: "Utils",
  description: "Use este comando para enviar um comando para o servidor",
  usage: "addcmd <cmd name> <cmd>",
};
