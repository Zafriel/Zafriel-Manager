const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");

module.exports = class Verify extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "verify";
    this.category = "Staff";
    this.description =
      "Comando para recusar/aceitar Bots enviados pelos Membros.";
    this.usage = "addBot";
    this.aliases = ["verificar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix, author) {
    const doc = await this.client.database.clientUtils.findOne({
      _id: this.client.user.id,
    });

    const USER =
      message.mentions.users.first() || this.client.users.cache.get(args[0]);

    const bots = doc.bots;
    const list = [];
    const id = parseInt(args[1]);

    const bot = bots
      .filter((x) => x.owner === USER.id && !x.status)
      .map((x) => x.bot);
    const find = bots.filter((x) => x.owner === USER.id);

    await this.PUSH(list, bot);

    if (!USER)
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, mencione/insira o ID do membro que você deseja aceitar o Bot.`
      );

    if (!bots.filter((x) => x.owner === USER.id).length)
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, este membro não tem nenhuma solicitação de Bot no servidor.`
      );

    if (!args[1] || isNaN(id) || id > find.length) {
      const EMBED = new ClientEmbed(author).setDescription(
        `> ${Emojis.Help} Bots do(a) ${
          message.author
        } que estão em fase de verificação:\n\n${list
          .map(
            (f, y) =>
              `・ID da Verificação: **\`${y + 1}\`**\n・Bot: **${
                f.bot.tag
              }**\n・ID: **${f.bot.id}**\n・Adicionado no Servidor: **${
                !f.find
                  ? `NÃO - [CONVITE](https://discord.com/oauth2/authorize?client_id=${f.bot.id}&permissions=0&scope=bot)`
                  : "SIM"
              }**`
          )
          .join("\n\n")}`
      );

      return message.channel.send(EMBED);
    }

    const doc1 = await this.client.database.users.findOne({
      _id: USER.id,
    });

    const target = await this.client.users.fetch(find[id - 1].bot);

    message.channel
      .send(
        `${message.author}, deseja aceitar o Bot do(a) **${target.tag}** membro(a): **${USER}**?`
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
              const sendMessage = await message.channel.send(
                `${Emojis.Reason} - ${message.author}, agora insira o motivo de ter aceito o Bot do Membro, caso não queira inserir nenhum motivo escreva **NADA** na resposta.`
              );

              await msg.delete();

              const collector = sendMessage.channel
                .createMessageCollector(
                  (m) => m.author.id === message.author.id,
                  { time: 120000 }
                )

                .on("collect", async ({ content }) => {
                  let reason = content;

                  if (content.toLowerCase() === "nada")
                    reason = "Nenhum Motivo";

                  message.channel.send(
                    `${Emojis.Certo} - ${message.author}, você aceitou o Bot ( **${target.tag}** ) do membro ${USER} com sucesso.`
                  );

                  this.client.users.cache
                    .get(USER.id)
                    .send(
                      `${Emojis.Certo} - ${USER}, seu Bot foi aceito, informações abaixo:\n\n> ${Emojis.User} Staff que Aceitou: **${message.author.tag}** ( \`${message.author.id}\` )\n> ${Emojis.Reason} Motivo: **${reason}**`
                    )
                    .catch((x) =>
                      message.channel
                        .send(
                          `${Emojis.Errado} - ${message.author}, a **DM** do membro está fechada, portanto não foi possível enviar a mensagem para ele.`
                        )
                        .then((x) => x.delete({ timeout: 5000 }))
                    );

                  let verify = [
                    doc1.bots.find((x) => x.idBot === String(find[id - 1].bot)),
                  ];

                  let verify2 = [
                    doc.bots.find((x) => x.bot === String(find[id - 1].bot)),
                  ];

                  await this.client.database.users.findOneAndUpdate(
                    { _id: USER.id },
                    {
                      $pull: {
                        bots: doc1.bots.find(
                          (x) => x.idBot === String(find[id - 1].bot)
                        ),
                      },
                    }
                  );

                  await this.client.database.clientUtils.findOneAndUpdate(
                    { _id: this.client.user.id },
                    {
                      $pull: {
                        bots: doc.bots.find(
                          (x) => x.bot === String(find[id - 1].bot)
                        ),
                      },
                    }
                  );

                  setTimeout(async () => {
                    verify2.map(async (z) => {
                      await this.client.database.clientUtils.findOneAndUpdate(
                        { _id: this.client.user.id },
                        {
                          $push: {
                            bots: [
                              {
                                bot: z.bot,
                                owner: USER.id,
                                status: true,
                                votes: 0,
                                verified: false,
                              },
                            ],
                          },
                        }
                      );
                    });

                    verify.map(async (z) => {
                      await this.client.database.users.findOneAndUpdate(
                        { _id: USER.id },
                        {
                          $push: {
                            bots: [
                              {
                                idBot: z.idBot,
                                acceptBy: message.author.id,
                                acceptIn: Date.now(),
                                author: USER.id,
                                status: true,
                                votes: 0,
                                verified: false,
                              },
                            ],
                          },
                        }
                      );
                    });
                  }, 2000);
                  collector.stop();
                });
            }

            if (collected.first().emoji.id === Emojis.reactions.Errado) {
              message.channel.send(
                `${Emojis.Errado} - ${message.author}, você recusou o Bot ( **${target.tag}** ) do membro ${USER} com sucesso.`
              );

              await this.client.database.users.findOneAndUpdate(
                { _id: USER.id },
                {
                  $pull: {
                    bots: doc1.bots.find(
                      (x) => x.idBot === String(find[id - 1].bot)
                    ),
                  },
                }
              );
              await this.client.database.clientUtils.findOneAndUpdate(
                { _id: this.client.user.id },
                {
                  $pull: {
                    bots: doc.bots.find(
                      (x) => x.bot === String(find[id - 1].bot)
                    ),
                  },
                }
              );

              msg.delete();
            }
          });
      });
  }
  async PUSH(list, bot) {
    for (const bots of bot) {
      list.push({
        bot: await this.client.users.fetch(bots),
        find: this.client.guilds.cache
          .get(process.env.GUILD_ID)
          .members.cache.find((x) => x.id === bots),
      });
    }
  }
};
