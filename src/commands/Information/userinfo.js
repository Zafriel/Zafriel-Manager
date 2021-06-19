const Discord = require("discord.js");
const moment = require("moment");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");

module.exports = class UserInfo extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "userinfo";
    this.category = "Information";
    this.description = "Comando para ver informações de algum usuário";
    this.usage = "userinfo <@user>";
    this.aliases = ["ui"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix, author) {
    moment.locale("pt-BR");
    const user = message.guild.member(
      this.client.users.cache.get(args[0]) ||
        message.mentions.members.first() ||
        message.author
    );

    const doc = await this.client.database.users.findOne({ _id: user.id });

    let presence;
    if (!user.presence.activities.length) presence = "Não está jogando nada";
    else presence = user.presence.activities.join(", ");

    const device = this.Device(user);
    const joined = `${moment(user.joinedAt).format("L")} ( ${moment(
      user.joinedAt
    )
      .startOf("day")
      .fromNow()} )`;
    const created = `${moment(
      this.client.users.cache.get(user.id).createdAt
    ).format("L")} ( ${moment(this.client.users.cache.get(user.id).createdAt)
      .startOf("day")
      .fromNow()} )`;

    const USERINFO = new ClientEmbed(author)
      .setTitle(user.user.username)
      .addFields(
        { name: "Jogando", value: `\`\`\`diff\n- ${presence}\`\`\`` },
        { name: "Nome do Usuário", value: user.user.tag, inline: true },
        {
          name: "Nickname no Servidor",
          value: !!user.nickname ? user.nickname : "Nenhum Nickname",
          inline: true,
        },
        { name: "🆔 ID do Usuário:", value: user.id },
        {
          name: `${Emojis.Calendar} Conta Criada`,
          value: created,
          inline: true,
        },

        {
          name: `${Emojis.Calendar} Entrada no Servidor`,
          value: joined,
          inline: true,
        },
        {
          name: "Dispositivo",
          value: String(device).replace("null", "Nenhum"),
        }
      )
      .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
      .setFooter(
        `Pedido por: ${message.author.tag} || ID: ${message.author.id}`,
        message.author.displayAvatarURL({ dynamic: true })
      );

    if (String(doc) != "null") {
      const bots = doc.bots.map((x) => x.idBot);
      const list = [];

      await this.BOTS(bots, list, user);

      if (bots.length)
        USERINFO.addField(
          `${Emojis.Robot} Bots no Servidor [${bots.length}/3]`,
          list
            .map(
              (x) =>
                `${
                  x.status
                    ? `> ${x.verified ? Emojis.Certo : ""}🟢 **${
                        x.user.tag
                      }** - Votos: **\`${
                        x.votes <= 0 ? "NENHUM" : x.votes.toLocaleString()
                      }\`**`
                    : `> 🟡 **${x.user.tag}** `
                }`
            )
            .join("\n")
        );
    }
    message.quote(USERINFO);
  }

  //================> Parte de Pegar o Dispositivo

  Device(user) {
    if (!user.presence.clientStatus) return null;
    let devices = Object.keys(user.presence.clientStatus);

    let deviceList = devices.map((x) => {
      if (x === "desktop") return `${Emojis.Computer} Computador`;
      else if (x === "mobile") return `${Emojis.Mobile} Celular`;
      else return `${Emojis.Robot} Bot`;
    });

    return deviceList.join(" - ");
  }

  async BOTS(bots, list, user) {
    const doc = await this.client.database.users.findOne({
      _id: user.id,
    });

    for (const bot of bots) {
      const info = doc.bots.filter((x) => x.idBot === bot)[0];

      list.push({
        user: await this.client.users.fetch(bot).then((user) => {
          return user;
        }),
        status: info.status,
        verified: info.verified,
        votes: info.votes,
      });
    }
  }
};
