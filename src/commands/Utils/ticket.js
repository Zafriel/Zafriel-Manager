const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
const Guild = require("../../database/Schemas/Guild");
const User = require("../../database/Schemas/User");

exports.run = async (client, message, args) => {
  moment.locale("pt-BR");

  const USER =
    message.mentions.users.first() ||
    client.users.cache.get(args[0]) ||
    message.author;
  const USER1 =
    message.mentions.users.first() || client.users.cache.get(args[0]);

  Guild.findOne({ _id: message.guild.id }, async (err, server) => {
    User.findOne({ _id: USER.id }, async (err, user) => {
      if (args[0] == "msg") {
        if (!server.staff.some((x) => x === message.author.id))
          return message.channel
            .send(
              `${message.author}, só Staff pode usar esse comando bobinho(a).`
            )
            .then((x) => x.delete({ timeout: 5000 }));

        const TICKET = new Discord.MessageEmbed()
          .setColor(process.env.EMBED_COLOR)
          .setDescription(
            `Olá, está com alguma dúvida sobre o **Bot** ou algum outro sistema de meu servidor? Basta reagir ao emoji desta mensagem ( ✅ ) para criar um **TICKET**, lembre-se você pode criar somente um **TICKET** por vez, então não tente abusar do comando. ^^`
          )
          .setAuthor(`Sistema de Ticket - Servidor Oficial do Bot Zafriel`);
        message.channel.send(TICKET).then(async (msg) => {
          await Guild.findOneAndUpdate(
            { _id: message.guild.id },
            {
              $set: {
                "ticket.msg": msg.id,
                "ticket.channel": message.channel.id,
                "ticket.guild": message.guild.id,
              },
            }
          );
          msg.react("✅");
        });
        message.delete().catch((O_o) => {});
        return;
      }

      if (args[0] == "fc" || args[0] == "forceclose") {
        if (!server.staff.some((x) => x === message.author.id))
          return message.channel
            .send(
              `${message.author}, só Staff pode usar esse comando bobinho(a).`
            )
            .then((x) => x.delete({ timeout: 5000 }));
        if (!USER1) {
          return message.channel
            .send(
              `${message.author}, você deve mencionar/inserir o ID de quem deseja fechar o **TICKET**.`
            )
            .then((x) => x.delete({ timeout: 5000 }));
        }
        User.findOne({ _id: USER1.id }, async (err, user1) => {
          if (!user1.ticket.have) {
            return message.channel
              .send(
                `${message.author}, este membro não possui nenhum **TICKET** aberto. `
              )
              .then((x) => x.delete({ timeout: 5000 }));
          } else {
            message.channel
              .send(
                `${message.author}, ok, vou fechar o **TICKET** do membro e excluir o canal.`
              )
              .then((x) => x.delete({ timeout: 5000 }));
            setTimeout(async (x) => {
              try {
                message.guild.channels.cache
                  .find((x) => x.id === user1.ticket.channel)
                  .delete();
              } catch (err) {
                if (err)
                  return message.channel
                    .send(
                      `${message.author}, ocorreu um **ERROR** ao executar o comando de fechar o **TICKET**, lembre-se **STAFF** não exclua o canal manualmente...`
                    )
                    .then(async (x) => {
                      await User.findOneAndUpdate(
                        { _id: USER1.id },
                        {
                          $set: {
                            "ticket.have": false,
                            "ticket.channel": "null",
                          },
                        }
                      );
                      x.delete({ timeout: 5000 });
                    });
              }
              await User.findOneAndUpdate(
                { _id: USER1.id },
                { $set: { "ticket.have": false, "ticket.channel": "null" } }
              );
            }, 4000);
          }
        });
        return;
      }

      if (args[0] == "fechar" || args[0] == "close") {
        if (!user.ticket.have) {
          return message.channel
            .send(
              `${message.author}, você não possui nenhum **TICKET** aberto para fechar.`
            )
            .then((x) => x.delete({ timeout: 5000 }));
        } else {
          message.channel
            .send(
              `${message.author}, ok, fechei seu **TICKET** e vou excluir o canal!`
            )
            .then((x) => x.delete({ timeout: 5000 }));
          setTimeout(async (x) => {
            try {
              message.guild.channels.cache
                .find((x) => x.id === user.ticket.channel)
                .delete();
            } catch (err) {
              if (err) {
                return message.channel
                  .send(
                    `${message.author}, ocorreu um **ERROR** ao executar o comando de fechar o **TICKET**, lembre-se **STAFF** não exclua o canal manualmente...`
                  )
                  .then(async (x) => {
                    await User.findOneAndUpdate(
                      { _id: message.author.id },
                      {
                        $set: {
                          "ticket.have": false,
                          "ticket.channel": "null",
                        },
                      }
                    );
                    x.delete({ timeout: 5000 });
                  });
              }
            }
            await User.findOneAndUpdate(
              { _id: message.author.id },
              { $set: { "ticket.have": false, "ticket.channel": "null" } }
            );
          }, 4000);
        }
        return;
      }

      const TICKETS = new Discord.MessageEmbed()
        .setColor(process.env.EMBED_COLOR)
        .setAuthor(
          `${USER.username} - Tickets`,
          USER.displayAvatarURL({ dynamic: true })
        )
        .setFooter(
          `Já criei um total de ${server.ticket.size} Tickets no Servidor.`
        )
        .setDescription(
          `${
            !user.ticket.have
              ? `Desculpe, mas este usuário não tem nenhum **TICKET** em aberto no momento.`
              : `Este membro possuí **1 TICKET** em aberto no momento, informações:\n\nCanal: <#${
                  user.ticket.channel
                }>\nData de abertura do **TICKET**: **( há **${String(
                  moment
                    .duration(Date.now() - user.ticket.created)
                    .format(
                      "M [meses] d [dias] h [horas] m [minutos] s [segundos]"
                    )
                ).replace("minsutos", "minutos")}** ) ( ${moment(
                  Number(user.ticket.created)
                ).format("LL")} )**`
          }`
        )
        .setThumbnail(USER.displayAvatarURL({ dynamic: true, size: 2048 }));

      message.channel.send(TICKETS);
    });
  });
};
exports.help = {
  name: "ticket",
  aliases: [],
  category: "Utils",
  description: "Use este comando para ver informações sobre seu Ticket",
  usage: "ticket",
};
