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

    if (!doc.verificadores.some((x) => x === message.author.id)) return;

    const USER =
      message.mentions.users.first() || this.client.users.cache.get(args[0]);

    const bots = doc.bots;
    const list = [];
    const id = parseInt(args[1]);

    if (!USER)
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, mencione/insira o ID do membro que você deseja aceitar o Bot.`
      );

    const bot = bots
      .filter((x) => x.owner === USER.id && !x.status)
      .map((x) => x.bot);
    const find = bots.filter((x) => x.owner === USER.id);

    await this.PUSH(list, bot);

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
        `${message.author}, o que você deseja fazer com o Bot **${target.tag}** do(a) membro(a) **${USER}**?\n\n> ${Emojis.Certo} Aceita o Bot\n> ${Emojis.Errado} Recusa o Bot`
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

                  this.client.channels.cache.get("855482567472840764").send(
                    USER,
                    new ClientEmbed(target)
                      .setDescription(
                        `${USER}, seu bot foi aceito pelo Staff ${message.author}.\n\n> ${Emojis.Reason} **${reason}**`
                      )
                      .setColor("#00ff1d")
                      .setTimestamp()
                      .setThumbnail(
                        target.displayAvatarURL({ format: "jpg", size: 2048 })
                      )
                      .setAuthor(
                        `Bot: ${target.tag}`,
                        target.displayAvatarURL()
                      )
                  );

                  this.client.users.cache
                    .get(USER.id)
                    .send(
                      `${Emojis.Certo} - ${USER}, seu Bot foi aceito, informações abaixo:\n\n> ${Emojis.User} Staff que Aceitou: **${message.author.tag}** ( \`${message.author.id}\` )\n> ${Emojis.Reason} Motivo: **${reason}**`
                    )
                    .catch(() =>
                      message.channel
                        .send(
                          `${Emojis.Errado} - ${message.author}, a **DM** do membro está fechada, portanto não foi possível enviar a mensagem para ele.`
                        )
                        .then((x) => x.delete({ timeout: 5000 }))
                    );

                  message.guild.member(USER.id).roles.add("855913108139933747");

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
              const sendMessage = await message.channel.send(
                `${Emojis.Reason} - ${message.author}, agora insira o motivo de ter recusado o Bot do Membro, caso não queira inserir nenhum motivo escreva **NADA** na resposta.`
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

                  this.client.channels.cache.get("855482567472840764").send(
                    USER,
                    new ClientEmbed(target)
                      .setDescription(
                        `${USER}, seu bot foi recusado pelo Staff ${message.author}.\n\n> ${Emojis.Reason} **${reason}**`
                      )
                      .setColor("#f50000")
                      .setTimestamp()
                      .setThumbnail(
                        target.displayAvatarURL({ format: "jpg", size: 2048 })
                      )
                      .setAuthor(
                        `Bot: ${target.tag}`,
                        target.displayAvatarURL()
                      )
                  );

                  this.client.users.cache
                    .get(USER.id)
                    .send(
                      `${Emojis.Errado} - ${USER}, seu Bot foi recusado, informações abaixo:\n\n> ${Emojis.User} Staff que Recusou: **${message.author.tag}** ( \`${message.author.id}\` )\n> ${Emojis.Reason} Motivo: **${reason}**`
                    )
                    .catch(() =>
                      message.channel
                        .send(
                          `${Emojis.Errado} - ${message.author}, a **DM** do membro está fechada, portanto não foi possível enviar a mensagem para ele.`
                        )
                        .then((x) => x.delete({ timeout: 5000 }))
                    );

                  const member = message.guild.member(target.id);

                  if (member)
                    member
                      .kick(`Bot Recusado pelo(a) ${message.author.tag}`)
                      .catch(() => {});

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
                  collector.stop();
                });
            }
          });
      });
  }
  async PUSH(list, bot) {
    const guild = this.client.guilds.cache.get("601848654202011677");

    for (const bots of bot) {
      list.push({
        bot: await this.client.users.fetch(bots),
        find: guild.members.cache.find((x) => x.id === bots),
      });
    }
  }
};
