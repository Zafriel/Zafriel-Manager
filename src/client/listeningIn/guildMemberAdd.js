module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(member) {
    const guild = this.client.guilds.cache.get(member.guild.id);

    if (guild.id != "601848654202011677") return;

    if (!member.user.bot) return;
    member.roles.add("791446491465252887", "Este membro é um Bot.");

    guild.channels.cache
      .get("855912041331294219")
      .send(`Novo Bot adicionado no Servidor: **${member.user.tag}**.`);
  }
};
