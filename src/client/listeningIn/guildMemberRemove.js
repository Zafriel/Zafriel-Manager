const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");

module.exports = class guildMemberRemove {
  constructor(client) {
    this.client = client;
  }

  async run(member) {
    const guild = this.client.guilds.cache.get(member.guild.id);

    if (guild.id != "601848654202011677") return;

    const user = await this.client.users.fetch(member.user.id);

    const doc1 = await this.client.database.clientUtils.findOne({
      _id: this.client.user.id,
    });

    if (user.bot) {
      const bots = doc1.bots;

      let filter = bots.filter((x) => x.bot === user.id);

      filter = filter[0];

      const owner = await this.client.users.fetch(filter.owner);

      const target = await this.client.database.users.findOne({
        _id: owner.id,
      });

      if (target.bots.length - 1 <= 0)
        await this.client.database.users.findOneAndUpdate(
          { _id: owner.id },
          { $set: { hasBot: 0 } }
        );

      await this.client.database.clientUtils.findOneAndUpdate(
        { _id: this.client.user.id },
        { $pull: { bots: doc1.bots.find((x) => x.owner === owner.id) } }
      );

      await this.client.database.users.findOneAndUpdate(
        { _id: owner.id },
        {
          $pull: {
            bots: target.bots.find((x) => x.idBot === user.id),
          },
        }
      );

      const EMBED = new ClientEmbed(this.client.user)
        .setThumbnail(user.displayAvatarURL({ format: "jpg", size: 2048 }))
        .setDescription(
          `${Emojis.Remove} Seu Bot **${user.tag}** foi removido do Servidor por algum de seus Donos, portanto ele foi descartado da minha **DataBase**, caso queira enviar novamente vá no canal de adicionar Bots.`
        )
        .setFooter(`Bot removido com Sucesso!`)
        .setTimestamp();

      return this.client.channels.cache
        .get("855482567472840764")
        .send(owner, EMBED);
    } else {
      const doc = await this.client.database.users.findOne({ _id: user.id });

      if (!doc.bots.length || String(doc) === "null") return;

      const list = doc.bots.map((x) => x.idBot);

      await this.RemoveBots(list, user, doc1);
    }
  }
  async RemoveBots(list, user, doc1) {
    const server = await this.client.guilds.fetch("601848654202011677");
    const bot_list = [];

    for (const bots of list) {
      const member = server.members.cache.get(bots);

      await this.client.database.users.findOneAndUpdate(
        { _id: user.id },
        { $set: { bots: [], hasbot: 0 } }
      );

      await this.client.database.clientUtils.findOneAndUpdate(
        { _id: this.client.user.id },
        { $pull: { bots: doc1.bots.find((x) => x.owner === user.id) } }
      );

      bot_list.push({
        user: await this.client.users.fetch(bots).then((user) => {
          return user;
        }),
      });

      member.kick("Dono do Bot Saiu do Servidor");
    }

    const EMBED = new ClientEmbed(this.client.user)
      .setThumbnail(user.displayAvatarURL({ format: "jpg", size: 2048 }))
      .setDescription(
        `${Emojis.Remove} O Membro **${
          user.tag
        }** saiu do servidor e possuia **${
          bot_list.length
        } Bots** no servidor, portanto os mesmo foram removidos!\n\nLista:\n${`**${bot_list
          .map((x) => `> ${x.user.tag}`)
          .join("\n")}**`}`
      )
      .setFooter(`Bots removidos com Sucesso!`)
      .setTimestamp();

    this.client.channels.cache.get("855482567472840764").send(EMBED);
  }
};
