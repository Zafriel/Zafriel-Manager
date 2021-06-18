const Command = require("../../structures/Command");
const Utils = require("../../utils/Util");

module.exports = class setStaff extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "setStaff";
    this.category = "Owner";
    this.description = "Comando para testar códigos";
    this.usage = "";
    this.aliases = ["ss"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix, author) {
    if (message.author.id !== "600804786492932101") return;

    const USER =
      message.mentions.users.first() || this.client.users.cache.get(args[0]);

    if (!USER)
      return message.quote(
        `${message.author}, mencione o membro que deseja adicionar/remover da Staff.`
      );

    const doc = await this.client.database.clientUtils.findOne({
      _id: this.client.user.id,
    });

    if (doc.staff.some((x) => x === USER.id)) {
      await this.client.database.clientUtils.findOneAndUpdate(
        { _id: this.client.user.id },
        { $pull: { staff: USER.id } }
      );
      return message.channel.send(
        `${message.author}, o membro já estava adicionado portanto eu removi ele.`
      );
    }

    await this.client.database.clientUtils.findOneAndUpdate(
      { _id: this.client.user.id },
      { $push: { staff: USER.id } }
    );

    message.channel.send(`${message.author}, membro adicionado com sucesso.`);
  }
};
