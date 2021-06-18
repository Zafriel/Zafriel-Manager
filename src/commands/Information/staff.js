const Discord = require("discord.js");
const moment = require("moment");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");

module.exports = class Staff extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "staff";
    this.category = "Information";
    this.description = "É isso";
    this.usage = "staff";
    this.aliases = ["stf"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix, author) {
    const doc = await this.client.database.clientUtils.findOne({
      _id: this.client.user.id,
    });

    const staffs = [];

    const members = doc.staff.map((x) => x);

    await this.PUSH(members, staffs);

    const EMBED = new ClientEmbed(this.client.user)
      .setTitle(
        `${Emojis.Staff} Lista dos Membros que estão na minha lista de Staff`
      )
      .setDescription(
        `Meu Desenvolvedor é o **${await this.client.users
          .fetch(process.env.OWNER_ID)
          .then((x) => x.tag)}**\n\nMembros da Staff: ${staffs
          .filter((f) => f.user.id != process.env.OWNER_ID)
          .map((x) => `**${x.user.tag}**`)
          .join(" `|` ")}`
      );

    message.quote(EMBED);
  }

  async PUSH(members, staffs) {
    for (const users of members) {
      staffs.push({ user: await this.client.users.fetch(users) });
    }
  }
};
