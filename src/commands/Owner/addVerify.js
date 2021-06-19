const Command = require("../../structures/Command");

module.exports = class addVerify extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "addVerify";
    this.category = "Owner";
    this.description = "Comando para testar códigos";
    this.usage = "";
    this.aliases = ["add-v", "av", "setverify", "sv", "set-v"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix, author) {
    if (message.author.id !== "600804786492932101") return;

    const USER =
      message.mentions.users.first() || this.client.users.cache.get(args[0]);

    if (!USER)
      return message.quote(
        `${message.author}, mencione o membro que deseja adicionar/remover como Verificadores.`
      );

    const doc = await this.client.database.clientUtils.findOne({
      _id: this.client.user.id,
    });

    if (doc.verificadores.some((x) => x === USER.id)) {
      await this.client.database.clientUtils.findOneAndUpdate(
        { _id: this.client.user.id },
        { $pull: { verificadores: USER.id } }
      );
      message.guild.members.cache
        .get(USER.id)
        .roles.remove(process.env.VERIFIY_ROLE)
        .catch((O_o) => {});
      return message.channel.send(
        `${message.author}, o membro já estava adicionado portanto eu removi ele.`
      );
    }

    await this.client.database.clientUtils.findOneAndUpdate(
      { _id: this.client.user.id },
      { $push: { verificadores: USER.id } }
    );
    message.guild.members.cache
      .get(USER.id)
      .roles.add(process.env.VERIFIY_ROLE)
      .catch((O_o) => {});
    message.channel.send(`${message.author}, membro adicionado com sucesso.`);
  }
};
