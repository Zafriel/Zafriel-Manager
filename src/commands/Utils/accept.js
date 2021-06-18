const moment = require("moment");
require("moment-duration-format");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");

module.exports = class Accept extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "accept";
    this.category = "Information";
    this.description = "É isso";
    this.usage = "addBot";
    this.aliases = ["aceitar"];

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

    const bot = bots.filter((x) => x.owner === USER.id).map((x) => x.bot);

    await this.PUSH(list, bot);

    if (!USER)
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, mencione/insira o ID do membro que você deseja aceitar o Bot.`
      );

    if (!bots.filter((x) => x.owner === USER.id).length)
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, este membro não tem nenhuma solicitação de Bot no servidor.`
      );

    const EMBED = new ClientEmbed(author).setDescription(
      `> ${Emojis.Help} Bots do(a) ${
        message.author
      } que estão em fase de verificação:\n\n${list
        .map(
          (f) =>
            `・Bot: **${f.bot.tag}**\n・ID: **${
              f.bot.id
            }**\n・Adicionado no Servidor: **${
              !f.find
                ? `NÃO - [CONVITE](https://discord.com/oauth2/authorize?client_id=${f.bot.id}&permissions=0&scope=bot)`
                : "SIM"
            }**`
        )
        .join("\n\n")}`
    );

    message.channel.send(EMBED);
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
