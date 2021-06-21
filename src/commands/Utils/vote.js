const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");
const moment = require("moment");
require("moment-duration-format");

module.exports = class Vote extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "vote";
    this.category = "Utils";
    this.description =
      "Comando para ver os Bots do Membro que estão no Servidor";
    this.usage = "addBot";
    this.aliases = ["votar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix, author) {
    moment.locale("pt-BR");

    const doc = await this.client.database.clientUtils.findOne({
      _id: this.client.user.id,
    });

    const doc1 = await this.client.database.users.findOne({
      _id: message.author.id,
    });

    let id = args[0];
    const cooldown = 2.88e7;
    const vote = doc1.lastVote;
    const time = cooldown - (Date.now() - vote);

    if (vote !== null && cooldown - (Date.now() - vote) > 0)
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, você deve aguardar **${moment
          .duration(time)
          .format("h [horas] m [minutos] e s [segundos]")
          .replace("minsutos", "minutos")}** até poder votar novamente.`
      );

    const bot = doc.bots.filter((x) => x.bot === id);

    if (!bot.length)
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, este Bot não está adicionado no Servidor.`
      );

    const target = await this.client.users.fetch(id);
    const info = bot[0];

    const doc2 = await this.client.database.users.findOne({ _id: info.owner });
    const user_bot = doc2.bots.filter((x) => x.idBot === id)[0];

    if (!user_bot.status)
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, este Bot ainda não foi aceito no Servidor portanto não é possível votar nele.`
      );

    message.channel
      .send(
        `${Emojis.Help} - ${
          message.author
        }, deseja votar no Bot ${target}? Informações:\n\n> ${
          Emojis.User
        } Dono: **${await this.client.users.fetch(info.owner).then((x) => {
          return x.tag;
        })}**\n > ${Emojis.Vote} Ele vai ficar com **${(
          user_bot.votes + 1
        ).toLocaleString()} Votos**`
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
              await msg.delete();

              message.channel.send(
                `${Emojis.Certo} - ${message.author}, voto enviado com sucesso.`
              );

              let verify = [doc2.bots.find((x) => x.idBot === id)];

              await this.client.database.users.findOneAndUpdate(
                { _id: message.author.id },
                { $set: { lastVote: Date.now() } }
              );

              await this.client.database.users.findOneAndUpdate(
                { _id: info.owner },
                {
                  $pull: {
                    bots: doc2.bots.find((x) => x.idBot === id),
                  },
                }
              );

              setTimeout(async () => {
                verify.map(async (z) => {
                  await this.client.database.users.findOneAndUpdate(
                    { _id: info.owner },
                    {
                      $push: {
                        bots: [
                          {
                            idBot: z.idBot,
                            acceptBy: z.acceptBy,
                            acceptIn: z.acceptIn,
                            author: z.author,
                            status: true,
                            votes: user_bot.votes + 1,
                            verified: z.verified,
                          },
                        ],
                      },
                    }
                  );
                });
              }, 200);

              this.client.channels.cache.get("855888260270391358").send(
                new ClientEmbed(target)
                  .setTitle(`${Emojis.Certo} Voto Recebido`)
                  .addFields(
                    {
                      name: `${Emojis.Robot} Bot`,
                      value: target.tag,
                      inline: true,
                    },
                    {
                      name: `🆔 ID do Bot`,
                      value: target.id,
                      inline: true,
                    },
                    {
                      name: `${Emojis.Vote} Total de Votos do Bot`,
                      value: `${user_bot.votes + 1} Votos`,
                      inline: false,
                    },
                    {
                      name: `${Emojis.User} Quem Votou`,
                      value: message.author.tag,
                      inline: true,
                    },
                    {
                      name: `🆔 ID do Membro`,
                      value: target.id,
                      inline: true,
                    }
                  )
                  .setColor("#f8bf02")
                  .setTimestamp()
                  .setThumbnail(
                    target.displayAvatarURL({ format: "jpg", size: 2048 })
                  )
                  .setFooter(target.id)
              );
            }

            if (collected.first().emoji.id === Emojis.reactions.Errado) {
              message.channel.send(
                `${Emojis.Errado} - ${message.author}, voto cancelado com sucesso.`
              );

              msg.delete();
            }
          });
      });
  }
};
