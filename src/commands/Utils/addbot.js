const moment = require("moment");
require("moment-duration-format");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");

module.exports = class addBot extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "addbot";
    this.category = "Utils";
    this.description = "Comando para enviar seu Bot para verificação.";
    this.usage = "addBot";
    this.aliases = ["addBot"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix, author) {
    const doc = await this.client.database.clientUtils.findOne({
      _id: this.client.user.id,
    });

    if (doc.bots.filter((x) => x.owner === message.author.id).length >= 3)
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, você atingiu o limite de 3 Bots no Servidor.`
      );

    moment.locale("pt-BR");

    const channels = ["855485629013819402", "751976776607203408"];

    if (!channels.some((x) => x === message.channel.id))
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, para adicionar seu Bot vá no canal <#855485629013819402>.`
      );

    const server = await this.client.database.guilds.findOne({
      _id: message.guild.id,
    });
    const user = await this.client.database.users.findOne({
      _id: message.author.id,
    });

    message.delete().catch((O_o) => {});

    if (user.bots.length >= 3)
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, você já tem o limite de Bots no Servidor/em verificação ( **3 Bots** ).`
      );

    let cooldown = 300000;
    let time = server.addBot.time;

    if (time !== null && cooldown - (Date.now() - time) > 0)
      return message.channel.send(
        `${message.author}, você deve aguardar o usuário **\`${
          server.addBot.lastUser
        }\`** acabar de responder as perguntas ou então pelo tempo **${moment
          .duration(cooldown - (Date.now() - time))
          .format("m [minutos] e s [segundos]")
          .replace("minsutos", "minutos")}**.`
      );

    await this.client.database.guilds.findOneAndUpdate(
      { _id: message.guild.id },
      {
        $set: {
          "addBot.lastUser": message.author.tag,
          "addBot.time": Date.now(),
        },
      }
    );

    const EMBED = new ClientEmbed(author).setDescription(
      `Responda as Perguntas`
    );

    message.channel.send(EMBED).then(async (y) => {
      const question1 = await message.channel.send(
        "> Qual ID do Bot:\n> Tempo de Resposta:`2 minutos`\n> Escreva **CANCELAR** para cancelar o Envio do Bot"
      );

      var idbot = message.channel.createMessageCollector(
        (x) => x.author.id == message.author.id,
        { time: 120000, max: 1 }
      );

      idbot.on("collect", async (c) => {
        if (c.content.toLowerCase() === "cancelar") {
          message.channel.send(
            `${Emojis.Certo} - ${message.author}, pedido cancelado com sucesso.`
          );
          y.delete();
          c.delete();

          return await this.client.database.guilds.findOneAndUpdate(
            { _id: message.guild.id },
            {
              $set: {
                "addBot.lastUser": "null",
                "addBot.time": Date.now() - 300000,
              },
            }
          );
        }
        if (c.content.length != 18 && isNaN(c.content)) {
          return message.channel
            .send(`ID's contém 18 números, use o comando novamente.`)
            .then(async (x) => {
              await this.client.database.guilds.findOneAndUpdate(
                { _id: message.guild.id },
                {
                  $set: {
                    "addBot.lastUser": "null",
                    "addBot.time": Date.now() - 300000,
                  },
                }
              );
              x.delete({ timeout: 5000 });
              y.delete();
              question1.delete();
              c.delete();
            });
        }

        if (doc.bots.find((x) => x.bot === c.content)) {
          const find = doc.bots.find((x) => x.bot === c.content);

          return message.channel
            .send(
              `${Emojis.Errado} - ${
                message.author
              }, este Bot já está no servidor, informações:\n\n> ${
                Emojis.User
              } Quem enviou: **${await this.client.users
                .fetch(find.owner)
                .then(
                  (x) => x.tag
                )}**\n\nCaso você seja o Dono desse Bot e outra pessoa enviou ele no seu lugar sem sua autorização contate algum Staff.`
            )
            .then(async (x) => {
              await this.client.database.guilds.findOneAndUpdate(
                { _id: message.guild.id },
                {
                  $set: {
                    "addBot.lastUser": "null",
                    "addBot.time": Date.now() - 300000,
                  },
                }
              );
              x.delete({ timeout: 10000 });
              y.delete();
              question1.delete();
              c.delete();
            });
        }
        const bot = await this.client.users.fetch(c.content);

        let date = moment.duration(Date.now() - bot.createdAt);

        let created =
          date.format("y") >= 1
            ? date.format(`y [anos] M [meses] d [dias]`)
            : date.format("M") >= 1
            ? date.format(`M [meses] d [dias] h [horas]`)
            : date.format("d") >= 1
            ? date
                .format(`d [dias] h [horas] m [minutos]`)
                .replace("minsutos", `minutos`)
            : date
                .format(`h [horas] m [minutos] s [${t("utils:time.seg")}]`)
                .replace("minsutos", `minutos`);

        if (!bot.bot) {
          return message.channel
            .send(
              `O ID inserido não pertence à um Bot, use o comando novamente.`
            )
            .then(async (x) => {
              await this.client.database.guilds.findOneAndUpdate(
                { _id: message.guild.id },
                {
                  $set: {
                    "addBot.lastUser": "null",
                    "addBot.time": Date.now() - 300000,
                  },
                }
              );
              x.delete({ timeout: 5000 });
              y.delete();
            });
        }

        let idBOT = c.content;

        const MSG = await this.client.channels.cache
          .get("855485629013819402")
          .messages.fetch(y.id);

        await MSG.edit(
          new ClientEmbed(author)
            .setAuthor(
              message.author.tag,
              message.author.displayAvatarURL({ dynamic: true })
            )
            .setDescription(
              `・ID do Bot: **${idBOT}**\n・Nome do Bot: **${bot.username}**\n・Criado há: **${created}**`
            )
            .setThumbnail(
              bot.avatarURL({ dynamic: true, size: 2048, format: "jpg" })
            )
        );

        question1.delete();
        c.delete().catch((O_o) => {});

        const question2 = await message.channel.send(
          "> Qual Prefixo do Bot?\n> Tempo de Resposta:`1 minuto`\n> Escreva **CANCELAR** para cancelar o Envio do Bot"
        );
        var prefixo = message.channel.createMessageCollector(
          (x) => x.author.id == message.author.id,
          { time: 60000 * 2, max: 1 }
        );
        prefixo.on("collect", async (c) => {
          if (c.content.toLowerCase() === "cancelar") {
            message.channel.send(
              `${Emojis.Certo} - ${message.author}, pedido cancelado com sucesso.`
            );
            y.delete();
            return await this.client.database.guilds.findOneAndUpdate(
              { _id: message.guild.id },
              {
                $set: {
                  "addBot.lastUser": "null",
                  "addBot.time": Date.now() - 300000,
                },
              }
            );
          }
          let prefixoBOT = c.content;

          await MSG.edit(
            new ClientEmbed(author)
              .setAuthor(
                message.author.tag,
                message.author.displayAvatarURL({ dynamic: true })
              )
              .setDescription(
                `・ID do Bot: **${idBOT}**\n・Nome do Bot: **${bot.username}**\n・Criado há: **${created}**\n・Prefixo do Bot: **${prefixoBOT}**`
              )
              .setThumbnail(
                bot.avatarURL({ dynamic: true, size: 2048, format: "jpg" })
              )
          );

          question2.delete();
          c.delete().catch((O_o) => {});

          const question3 = await message.channel.send(
            "> Em que linguagem o Bot foi desenvolvido??\n> Tempo de Resposta:`1 minuto`"
          );
          var linguagem = message.channel.createMessageCollector(
            (x) => x.author.id == message.author.id,
            { time: 60000, max: 1 }
          );
          linguagem.on("collect", async (c) => {
            if (c.content.toLowerCase() === "cancelar") {
              message.channel.send(
                `${Emojis.Certo} - ${message.author}, pedido cancelado com sucesso.`
              );
              y.delete();
              return await this.client.database.guilds.findOneAndUpdate(
                { _id: message.guild.id },
                {
                  $set: {
                    "addBot.lastUser": "null",
                    "addBot.time": Date.now() - 300000,
                  },
                }
              );
            }
            let linguagemBOT = c.content;

            await MSG.edit(
              new ClientEmbed(author)
                .setAuthor(
                  message.author.tag,
                  message.author.displayAvatarURL({ dynamic: true })
                )
                .setDescription(
                  `・ID do Bot: **${idBOT}**\n・Nome do Bot: **${bot.username}**\n・Criado há: **${created}**\n・Prefixo do Bot: **${prefixoBOT}**\n・Linguagem do Bot: **${linguagemBOT}**`
                )
                .setThumbnail(
                  bot.avatarURL({ dynamic: true, size: 2048, format: "jpg" })
                )
            );

            question3.delete();
            c.delete().catch((O_o) => {});

            const BotAdd = new ClientEmbed(bot)
              .setColor(process.env.EMBED_COLOR)
              .addFields(
                {
                  name: "Dono do Bot",
                  value: message.author.tag,
                },
                {
                  name: "ID do Dono",
                  value: message.author.id,
                },
                {
                  name: "ID do Bot",
                  value: idBOT,
                },
                {
                  name: `Prefixo do Bot`,
                  value: prefixoBOT,
                },
                {
                  name: "Linguagem de Desenvolvimento",
                  value: linguagemBOT,
                },
                {
                  name: "Bot enviado em",
                  value: moment(Date.now()).format("LLLL"),
                },
                {
                  name: "Convite do Bot",
                  value: `**[Clique Aqui](https://discord.com/oauth2/authorize?client_id=${idBOT}&permissions=0&scope=bot)**`,
                }
              )
              .setFooter(
                `Bot enviado por: ${message.author.tag}`,
                message.author.avatarURL({ dynamic: true })
              )
              .setThumbnail(
                bot.avatarURL({ dynamic: true, size: 2048, format: "jpg" })
              );

            const doc = await this.client.database.clientUtils.findOne({
              _id: this.client.user.id,
            });
            await this.client.database.clientUtils.findOneAndUpdate(
              { _id: this.client.user.id },
              { $set: { botCount: doc.botCount + 1 } }
            );

            await this.client.users.fetch(idBOT).then(async (f) => {
              await this.client.database.guilds.findOneAndUpdate(
                { _id: message.guild.id },
                {
                  $set: {
                    "addBot.lastUser": "null",
                    "addBot.time": Date.now() - 300000,
                  },
                }
              );

              await this.client.database.users.findOneAndUpdate(
                { _id: message.author.id },
                {
                  $push: {
                    bots: [
                      {
                        idBot: idBOT,
                        status: false,
                        author: message.author.id,
                        acceptIn: 0,
                        acceptBy: "null",
                      },
                    ],
                  },
                }
              );

              message.channel.send(
                `${
                  message.author
                }, seu bot foi enviado com sucesso, aguarde até que algum Staff o aceite. Seu Bot está em **${
                  doc.botCount + 1
                }º Lugar** na fila de verificação.`
              );
              this.client.channels.cache.get("855482679826055178").send(BotAdd);

              const EMBED_SEND = new ClientEmbed(bot)
                .setTitle(`Novo Bot enviado para Verificação`)
                .setDescription(
                  `${message.author} seu Bot ( **${
                    f.username
                  }** ) foi enviado para verificação.`
                )
                .setTimestamp()
                .setThumbnail(
                  bot.avatarURL({ dynamic: true, size: 2048, format: "jpg" })
                );

              this.client.channels.cache
                .get("855482567472840764")
                .send(`<@&${process.env.VERIFIY_ROLE}>`, EMBED_SEND);

              await this.client.database.clientUtils.findOneAndUpdate(
                { _id: this.client.user.id },
                { $push: { bots: [{ owner: message.author.id, bot: idBOT }] } }
              );
            });
          });
        });
      });
      y.delete({ timeout: 60000 * 2 }).catch((O_o) => {});
    });
  }
};
