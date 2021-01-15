const Discord =  require('discord.js');
const Guild = require("../../database/Schemas/Guild");



exports.run = async (client, message, args) => {
    
Guild.findOne({ _id: message.guild.id }, async function (err, server) {

    message.channel.send(`${message.author}, lista dos usuários que são Staff do meu servidor: ${server.staff.map((x) => `**\`${client.users.cache.get(x).tag}\`**`).join(" - ")}`)

})

}
exports.help = {
name: "staff",
aliases: [],
category: "Information"
};
