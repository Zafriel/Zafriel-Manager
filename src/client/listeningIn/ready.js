const Guild = require("../../database/Schemas/Guild"),
  User = require("../../database/Schemas/User"),
  Commands = require("../../database/Schemas/Command"),
  Client = require("../../database/Schemas/Client");
const c = require("colors");

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run() {
    this.client.database.users = User;
    this.client.database.guilds = Guild;
    this.client.database.clientUtils = Client;
    this.client.database.commands = Commands;

    setInterval(() => {
      this.client.channels.cache
        .get("829521984869105705")
        .send("https://zafriel-dois.glitch.me/");
    }, 20000);

    const status = [
      {
        name: "Supervisionando o Servidor do Zafriel",
      },
    ];
    setInterval(() => {
      var randomStatus = status[Math.floor(Math.random() * status.length)];
      this.client.user.setActivity(randomStatus.name);
    }, 10 * 1000);

    this.client.user.setStatus("dnd");
    console.log(c.red(`[Client] - Bot Ligado e Funcionando Com Sucesso.`));
  }
};
