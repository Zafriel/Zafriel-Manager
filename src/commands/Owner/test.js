const Command = require("../../structures/Command");
const Utils = require('../../utils/Util')

module.exports = class Test extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "test";
    this.category = "Owner";
    this.description = "Comando para testar códigos";
    this.usage = "";
    this.aliases = [];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run( message, args, prefix, author) {
    if (message.author.id !== "600804786492932101") return;

    const list_bots = await require("mongoose")
    .connection.collection("users")
    .find("")
    .toArray();

    console.log(list_bots)

  }
};
