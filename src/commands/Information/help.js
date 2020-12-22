
const Discord  = require("discord.js");

exports.run = (client, message, args) => {

    let AJUDA = new Discord.MessageEmbed()
    .setColor(process.env.EMBED_COLOR)
    .setAuthor(`${client.user.username} - Central de Ajuda`, client.user.displayAvatarURL({dynamic: true}))
    .addFields({
        name: "Staff",
        value: "\`aceitar\`, \`recusar\`, \`remover\`, \`set\`"
    },
    {
        name: "Utils",
        value: "\`info\`, \`addbot\`, \`staff\`"
    })
    .setThumbnail(client.user.displayAvatarURL({dynamic: true, size: 2048}))
    .setFooter(`Pedido por ${message.author.username}`, message.author.displayAvatarURL({dynamic: true}))
    .setTimestamp()

    message.channel.send(AJUDA)

}

  exports.help = {
    name: "help",
    aliases: ["ajuda"],
  };
  