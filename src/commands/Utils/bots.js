const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");
const moment = require("moment");
require("moment-duration-format");

module.exports = class Bots extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "bots";
    this.category = "Utils";
    this.description = "Comando para ver os Bots do Membro que estão no Servidor";
    this.usage = "addBot";
    this.aliases = ["bot"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix, author) {
    moment.locale("pt-BR");
    const USER =
      message.mentions.users.first() ||
      this.client.users.cache.get(args[0]) ||
      message.author;

    const doc = await this.client.database.users.findOne({
      _id: USER.id,
    });

    const bots = doc.bots;
    const accepts = bots.filter((x) => x.status);
    const noVerify = bots.filter((x) => !x.status);

    if (accepts.length <= 0 && noVerify.length <= 0)
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, você não tem nenhum Bot enviado/aceito no Servidor, vá no chat <#855485629013819402> e envie um Bot.`
      );

    const accept_list = accepts.map((f) => f.idBot);
    const noVerify_list = noVerify.map((f) => f.idBot);

    const list_one = [];
    const list_two = [];

    await this.ACCEPT(accept_list, list_one, USER);
    await this.VERIFY(noVerify_list, list_two);

    const EMBED = new ClientEmbed(author)
      .setTitle(
        `Informações do seus Bots [${accepts.length + noVerify.length}/3]`
      )
      .addFields(
        {
          name: `${Emojis.Certo} Bots Aceitos`,
          value:
            accepts.length <= 0
              ? "Nenhum"
              : list_one
                  .map(
                    (x) =>
                      `> Bot: **${x.bot.tag}**\n> ID: **${
                        x.bot.id
                      }**\n> Aceito por: **${
                        x.author.tag
                      }**\n> Data que foi Aceito: **${moment(x.time).format(
                        "L LT"
                      )}**`
                  )
                  .join("\n\n"),
        },
        {
          name: `${Emojis.Process} Bots Em Verificação`,
          value:
            noVerify.length <= 0
              ? "Nenhum"
              : list_two
                  .map((x) => `> Bot: **${x.bot.tag}**\n> ID: **${x.bot.id}**`)
                  .join("\n\n"),
        }
      );

    message.channel.send(EMBED);
  }
  async ACCEPT(accept_list, list_one, USER) {
    for (const list of accept_list) {
      const doc = await this.client.database.users.findOne({
        _id: USER.id,
      });

      const bot = doc.bots.filter((x) => x.idBot === list)[0];

      list_one.push({
        bot: await this.client.users.fetch(list),
        author: await this.client.users.fetch(bot.acceptBy),
        time: bot.acceptIn,
      });
    }
  }
  async VERIFY(noVerify_list, list_two) {
    for (const list of noVerify_list) {
      list_two.push({ bot: await this.client.users.fetch(list) });
    }
  }
};
