const Discord = require("discord.js");
const moment = require("moment");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");

module.exports = class ServerInfo extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "serverinfo";
    this.category = "Information";
    this.description = "Comando para ver informações sobre o servidor";
    this.usage = "serverinfo";
    this.aliases = ["si"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix, author) {
    moment.locale("pt-br");

    const guild = message.guild;

    let online = guild.members.cache.filter(
      (x) => x.presence.status == "online"
    ).size;
    let dnd = guild.members.cache.filter(
      (x) => x.presence.status == "dnd"
    ).size;
    let idle = guild.members.cache.filter(
      (x) => x.presence.status == "idle"
    ).size;
    let offline = guild.members.cache.filter(
      (x) => x.presence.status == "offline"
    ).size;

    let date = moment.duration(Date.now() - guild.createdAt);

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

    let boost =
      message.guild.premiumSubscriptionCount === 0
        ? "Nenhum Boost"
        : `${message.guild.premiumSubscriptionCount} Boost(s) ( Level: ${message.guild.premiumTier} )`;

    const SERVERINFO = new ClientEmbed(author)
      .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
      .addFields(
        { name: "ID do Servidor:", value: message.guild.id, inline: true },
        {
          name: `${Emojis.Crown} Propietário:`,
          value: message.guild.owner.user.tag,
          inline: true,
        },
        {
          name: "Data de Criação:",
          value: `${created} ( ${moment(message.guild.createdAt).format(
            "L"
          )} )`,
        },
        {
          name: "Data da minha Entrada:",
          value: `${moment(
            message.guild.member(this.client.user.id).joinedAt
          ).format("L")} ( ${moment(
            message.guild.member(this.client.user.id).joinedAt
          )
            .startOf("day")
            .fromNow()} )`,
          inline: true,
        },
        { name: `${Emojis.Boost} Boost`, value: boost },
        {
          name: "Total de Usuários:",
          value: message.guild.memberCount.toLocaleString(),
          inline: true,
        },
        {
          name: "Bots:",
          value: message.guild.members.cache
            .filter((x) => x.user.bot)
            .size.toLocaleString(),
          inline: true,
        },
        {
          name: `Status dos Membros`,
          value: `${Emojis.Online} Online: ${online}\n${Emojis.Idle} Ausente: ${idle}\n${Emojis.Dnd} Ocupado: ${dnd}\n${Emojis.Offline} Offline: ${offline}`,
        }
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true }));

    await message.quote(SERVERINFO);
  }
};
