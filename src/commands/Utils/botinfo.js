const moment = require("moment");
require("moment-duration-format");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");

module.exports = class botInfo extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "botinfo";
    this.category = "Utils";
    this.description = "Comando para ver informações sobre um Bot do Servidor.";
    this.usage = "botinfo <id>";
    this.aliases = ["b-info", "bot-info", "bi"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix, author) {
    moment.locale("pt-BR");
    const doc = await this.client.database.clientUtils.findOne({
      _id: this.client.user.id,
    });

    const id = args[0];
    if (!id)
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, você deve inserir o ID do Bot que quer ver as informações.`
      );

    let bot = doc.bots.filter((x) => x.bot === id);

    if (!bot.length)
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, bot não encontrado.`
      );

    bot = bot[0];

    const bot_target = await this.client.users.fetch(id);
    const owner = await this.client.users.fetch(bot.owner);

    const doc1 = await this.client.database.users.findOne({ _id: owner.id });

    let bot_find = doc1.bots.filter((x) => x.idBot === id);

    bot_find = bot_find[0];

    const EMBED = new ClientEmbed(bot_target)
      .setAuthor(
        bot_target.username,
        bot_target.displayAvatarURL({ format: "jpg", size: 2048 })
      )
      .setDescription(
        `Informações sobre o Bot: **${bot_target.tag}**\n\n> ${
          Emojis.User
        } Dono: **${owner.tag}**\n> ${Emojis.Process} Verificado: **${
          bot_find.status ? "🟢 Sim" : "🟡 Não"
        }** \n> ${Emojis.Robot} Bot aceito pelo(a) **${await this.client.users
          .fetch(bot_find.acceptBy)
          .then((x) => x.tag)}**\n> ${Emojis.Calendar} Aceito em: **${moment(
          bot_find.acceptIn
        ).format("L LT")}**\n> ${
          Emojis.Vote
        } Votos: **${bot_find.votes.toLocaleString()}**\n> ${
          Emojis.Pass
        } ZafrielPass: **${bot_find.verified ? "Sim" : "Não"}**`
      )
      .setThumbnail(bot_target.displayAvatarURL({ format: "jpg", size: 2048 }))
      .setTimestamp()
      .setFooter(`Bot do(a) ${owner.tag}`);

    message.channel.send(message.author, EMBED);
  }
};
