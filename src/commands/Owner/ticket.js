const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
const Command = require("../../structures/Command");
const Emojis = require("../../utils/Emojis");

module.exports = class Ticket extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "ticket";
    this.category = "Owner";
    this.description = "Comando para testar códigos";
    this.usage = "";
    this.aliases = [];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix, author) {
    moment.locale("pt-BR");

    const USER =
      message.mentions.users.first() ||
      this.client.users.cache.get(args[0]) ||
      message.author;
    const USER1 =
      message.mentions.users.first() || this.client.users.cache.get(args[1]);

    const server = await this.client.database.guilds.findOne({
      _id: message.guild.id,
    });
    const user = await this.client.database.users.findOne({ _id: USER.id });
    const client = await this.client.database.clientUtils.findOne({
      _id: this.client.user.id,
    });

    if (args[0] == "msg") {
      if (!client.staff.some((x) => x === message.author.id))
        return message.channel
          .send(
            `${Emojis.Errado} - ${message.author}, só Staff pode usar esse comando bobinho(a).`
          )
          .then((x) => x.delete({ timeout: 5000 }));

      const TICKET = new Discord.MessageEmbed()
        .setColor(process.env.EMBED_COLOR)
        .setDescription(
          `${Emojis.Help} Está precisando de ajuda?\nBasta reagir no Emoji ( ${Emojis.Certo} ) que fica nesta mensagem, com isso eu irei **criar** um **Canal** aonde somente você e meus Staffs terão acesso, e com isso você poderá sanar todas suas dúvidas, só é possível criar um **TICKET** por pessoa. ^^`
        )
        .setAuthor(`Sistema de Ticket - Servidor Oficial do Bot Zafriel`);
      message.channel.send(TICKET).then(async (msg) => {
        await this.client.database.guilds.findOneAndUpdate(
          { _id: message.guild.id },
          {
            $set: {
              "ticket.msg": msg.id,
              "ticket.channel": message.channel.id,
              "ticket.guild": message.guild.id,
            },
          }
        );
        msg.react(Emojis.reactions.Certo);
      });
      message.delete().catch((O_o) => {});
      return;
    }

    if (args[0] == "fc" || args[0] == "forceclose") {
      if (!client.staff.some((x) => x === message.author.id))
        return message.channel
          .send(
            `${Emojis.Errado} - ${message.author}, só Staff pode usar esse comando bobinho(a).`
          )
          .then((x) => x.delete({ timeout: 5000 }));
      if (!USER1) {
        return message.channel
          .send(
            `${Emojis.Errado} - ${message.author}, você deve mencionar/inserir o ID de quem deseja fechar o **TICKET**.`
          )
          .then((x) => x.delete({ timeout: 5000 }));
      }
      const user1 = await this.client.database.users.findOne({ _id: USER1.id });
      if (!user1.ticket.have) {
        return message.channel
          .send(
            `${Emojis.Errado} - ${message.author}, este membro não possui nenhum **TICKET** aberto. `
          )
          .then((x) => x.delete({ timeout: 5000 }));
      } else {
        message.channel
          .send(
            `${Emojis.Certo} - ${message.author}, ok, vou fechar o **TICKET** do membro e excluir o canal.`
          )
          .then((x) => x.delete({ timeout: 5000 }));
        setTimeout(async () => {
          try {
            message.guild.channels.cache
              .find((x) => x.id === user1.ticket.channel)
              .delete();
          } catch (err) {
            if (err)
              return message.channel
                .send(
                  `${Emojis.Certo} - ${message.author}, ocorreu um **ERROR** ao executar o comando de fechar o **TICKET**, lembre-se **STAFF** não exclua o canal manualmente...`
                )
                .then(async (x) => {
                  await this.client.database.users.findOneAndUpdate(
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
          await this.client.database.users.findOneAndUpdate(
            { _id: USER1.id },
            { $set: { "ticket.have": false, "ticket.channel": "null" } }
          );
        }, 4000);
      }
      return;
    }

    if (args[0] == "fechar" || args[0] == "close") {
      if (!user.ticket.have) {
        return message.channel
          .send(
            `${Emojis.Errado} - ${message.author}, você não possui nenhum **TICKET** aberto para fechar.`
          )
          .then((x) => x.delete({ timeout: 5000 }));
      } else {
        message.channel
          .send(
            `${Emojis.Certo} - ${message.author}, estou fechando seu **TICKET** e logo após irei deletar o canal, obrigado!`
          )
          .then((x) => x.delete({ timeout: 5000 }));
        setTimeout(async () => {
          try {
            message.guild.channels.cache
              .find((x) => x.id === user.ticket.channel)
              .delete();
          } catch (err) {
            if (err) {
              return message.channel
                .send(
                  `${Emojis.Errado} - ${message.author}, ocorreu um **ERROR** ao executar o comando de fechar o **TICKET**, lembre-se **STAFF** não exclua o canal manualmente...`
                )
                .then(async (x) => {
                  await this.client.database.users.findOneAndUpdate(
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
          await this.client.database.users.findOneAndUpdate(
            { _id: message.author.id },
            { $set: { "ticket.have": false, "ticket.channel": "null" } }
          );
        }, 4000);
      }
      return;
    }

    if (!user.ticket.have)
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, nenhum **TICKET** encontrado nessa conta \`( ${USER.tag} )\`.`
      );

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
        `${`Este membro possuí **1 TICKET** em aberto no momento, informações:\n\nCanal: <#${
          user.ticket.channel
        }>\nData de abertura do **TICKET**: **( há **${String(
          moment
            .duration(Date.now() - user.ticket.created)
            .format("M [meses] d [dias] h [horas] m [minutos] s [segundos]")
        ).replace("minsutos", "minutos")}** ) ( ${moment(
          Number(user.ticket.created)
        ).format("LL")} )**`}`
      )
      .setThumbnail(USER.displayAvatarURL({ dynamic: true, size: 2048 }));

    message.channel.send(TICKETS);
  }
};
