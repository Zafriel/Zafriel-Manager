const Discord = require("discord.js")

exports.run = async (client, message, args) => {

    if (message.author.id !== "600804786492932101") return;
    let servidores = ["701989711543140352"]

    servidores.forEach(async(x) => {
        let test = await client.guilds.fetch(x)
        console.log(test.name)
    })
}

  
  exports.help = {
    name: "verify",
    aliases: [],
  };
  