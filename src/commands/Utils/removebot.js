const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");
const moment = require("moment");
require("moment-duration-format");

module.exports = class removeBot extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "removeBot";
    this.category = "Utils";
    this.description =
      "Comando para Remover seu Bot do Servidor caso você queira.";
    this.usage = "addBot";
    this.aliases = ["removerbot", "r-bot", "remove-b"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix, author) {
    moment.locale("pt-BR");

    const doc = await this.client.database.users.findOne({
      _id: message.author.id,
    });

    const doc1 = await this.client.database.clientUtils.findOne({
      _id: this.client.user.id,
    });

    const bots = doc.bots.map((x) => x.idBot);
    const list = [];

    await this.PUSH(bots, list);

    if (args[0] == "force") {
      if (!doc1.staff.some((x) => x == message.author.id))
        return message.channel.send(
          `${Emojis.Errado} - ${message.author}, somente meus Staffs podem remover Bots de outras pessoas.`
        );

      const USER =
        message.mentions.users.first() || this.client.users.cache.get(args[1]);

      if (!USER)
        return message.channel.send(
          `${Emojis.Errado} - ${message.author}, mencione/insira o ID do membro.`
        );

      const target = await this.client.database.users.findOne({
        _id: USER.id,
      });

      const bots2 = target.bots.map((x) => x.idBot);

      if (!bots2.length || String(target) === "null")
        return message.channel.send(
          `${Emojis.Errado} - ${message.author}, membro não tem nenhum Bot no Servidor.`
        );

      const id = args[2];

      const find = await this.client.users.fetch(id).catch(() => {});
      let bot = target.bots.filter((x) => x.idBot === id);

      if (!bot.length)
        return message.channel.send(
          `${Emojis.Errado} - ${message.author}, Bot não encontrado na Conta do(a) Membro(a).`
        );

      bot = bot[0];

      if (bots2.some((x) => x === id)) {
        message.channel
          .send(
            `${Emojis.Help} - ${message.author}, deseja retirar o Bot **${
              find.tag
            }** do(a) membro(a) **${
              USER.tag
            }**? Informações sobre ele abaixo:\n\n> **${
              !bot.status ? "🟡 Em Verificação" : "🟢  Verificado"
            }**\n> ${Emojis.User} Aceito pelo(a) **${await this.client.users
              .fetch(bot.acceptBy)
              .then((x) => x.tag)}**\n> ${
              Emojis.Calendar
            } Aceito em: **${moment(bot.acceptIn).format("L LT")}**\n> ${
              Emojis.Pass
            } Zafriel Pass: **${!bot.verified ? "🔴 Não" : "🟢 Sim"}**\n> ${
              Emojis.Vote
            } Votos: **${
              bot.votes <= 0 ? "Nenhum" : bot.votes.toLocaleString()
            }**`
          )
          .then(async (msg) => {
            for (let emoji of [Emojis.reactions.Certo, Emojis.reactions.Errado])
              await msg.react(emoji);

            msg
              .awaitReactions(
                (reaction, member) =>
                  member.id === message.author.id &&
                  [Emojis.reactions.Certo, Emojis.reactions.Errado].includes(
                    reaction.emoji.id
                  ),
                { max: 1 }
              )
              .then(async (collected) => {
                if (collected.first().emoji.id === Emojis.reactions.Certo) {
                  message.channel.send(
                    `${Emojis.Certo} - ${message.author}, Bot do(a) Membro(a) removido com sucesso.`
                  );

                  const member = message.guild.member(find.id);

                  if (member)
                    member
                      .kick(`Bot Removido pelo(a) ${message.author.tag}`)
                      .catch(() => {});

                  USER.send(
                    `${Emojis.Robot} - ${USER}, seu Bot **${find.tag}** foi removido do Servidor pelo(a) ${message.author}`
                  ).catch(() => {});

                  await this.client.database.users.findOneAndUpdate(
                    { _id: USER.id },
                    {
                      $pull: {
                        bots: target.bots.find((x) => x.idBot === id),
                      },
                    }
                  );

                  await this.client.database.clientUtils.findOneAndUpdate(
                    { _id: this.client.user.id },
                    {
                      $pull: {
                        bots: doc1.bots.find((x) => x.bot === id),
                      },
                    }
                  );

                  msg.delete();
                }

                if (collected.first().emoji.id === Emojis.reactions.Errado) {
                  msg.delete();

                  message.channel.send(
                    `${Emojis.Certo} - ${message.author}, operação cancelada.`
                  );
                }
              });
          });

        return;
      }

      const list2 = [];

      await this.PUSH2(bots2, list2);

      const EMBED = new ClientEmbed(author).setDescription(
        `${Emojis.User} - ${message.author}, lista dos Bots do(a) **${
          USER.tag
        }** no Servidor. Para remover algum Bot dele(a) use:\n**${prefix}r-bot ${USER}/${
          USER.id
        } <ID do Bot>**.\n\n${list2
          .map((x) => `> **${x.bot.tag}**\n> ID: **\`${x.bot.id}\`**`)
          .join("\n\n")}`
      );
      return message.channel.send(EMBED);
    }

    if (!doc.bots.length || String(doc) === "null")
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, você não tem nenhum Bot no Servidor.`
      );

    const bots2 = doc.bots.map((x) => x.idBot);

    const id = args[0];

    if (id) {
      const find = await this.client.users.fetch(id).catch(() => {});
      let bot = doc.bots.filter((x) => x.idBot === id);

      if (!bot.length)
        return message.channel.send(
          `${Emojis.Errado} - ${message.author}, você não possuí esse Bot.`
        );

      bot = bot[0];

      if (bots2.some((x) => x === id)) {
        message.channel
          .send(
            `${Emojis.Help} - ${message.author}, deseja remover o seu Bot **${
              find.tag
            }** do servidor? Informações sobre ele abaixo:\n\n> **${
              !bot.status ? "🟡 Em Verificação" : "🟢  Verificado"
            }**\n> ${Emojis.User} Aceito pelo(a) **${await this.client.users
              .fetch(bot.acceptBy)
              .then((x) => x.tag)}**\n> ${
              Emojis.Calendar
            } Aceito em: **${moment(bot.acceptIn).format("L LT")}**\n> ${
              Emojis.Pass
            } Zafriel Pass: **${!bot.verified ? "🔴 Não" : "🟢 Sim"}**\n> ${
              Emojis.Vote
            } Votos: **${
              bot.votes <= 0 ? "Nenhum" : bot.votes.toLocaleString()
            }**`
          )
          .then(async (msg) => {
            for (let emoji of [Emojis.reactions.Certo, Emojis.reactions.Errado])
              await msg.react(emoji);

            msg
              .awaitReactions(
                (reaction, member) =>
                  member.id === message.author.id &&
                  [Emojis.reactions.Certo, Emojis.reactions.Errado].includes(
                    reaction.emoji.id
                  ),
                { max: 1 }
              )
              .then(async (collected) => {
                if (collected.first().emoji.id === Emojis.reactions.Certo) {
                  message.channel.send(
                    `${Emojis.Certo} - ${message.author}, Bot removido com sucesso.`
                  );

                  const member = message.guild.member(find.id);

                  if (member)
                    member.kick(`Bot Removido pelo Dono.`).catch(() => {});

                  await this.client.database.users.findOneAndUpdate(
                    { _id: message.author.id },
                    {
                      $pull: {
                        bots: doc.bots.find((x) => x.idBot === id),
                      },
                    }
                  );
                  await this.client.database.clientUtils.findOneAndUpdate(
                    { _id: this.client.user.id },
                    {
                      $pull: {
                        bots: doc1.bots.find((x) => x.bot === id),
                      },
                    }
                  );

                  msg.delete();
                }

                if (collected.first().emoji.id === Emojis.reactions.Errado) {
                  msg.delete();

                  message.channel.send(
                    `${Emojis.Certo} - ${message.author}, operação cancelada.`
                  );
                }
              });
          });

        return;
      }
      return;
    }
    const EMBED = new ClientEmbed(author).setDescription(
      `${Emojis.User} - ${
        message.author
      }, lista dos Bots que você tem no servidor logo abaixo, para remover algum deles use: **${prefix}r-bot <ID do Bot>**\n\n${list
        .map((x) => `> **${x.bot.tag}**\n> ID: **\`${x.bot.id}\`**`)
        .join("\n\n")}`
    );
    message.channel.send(EMBED);
  }

  async PUSH(bots, list) {
    for (const map of bots) {
      list.push({
        bot: await this.client.users.fetch(map),
      });
    }
  }
  async PUSH2(bots2, list2) {
    for (const map of bots2) {
      list2.push({
        bot: await this.client.users.fetch(map),
      });
    }
  }
};
