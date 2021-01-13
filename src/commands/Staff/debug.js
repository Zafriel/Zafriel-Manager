const Guild = require("../../database/Schemas/Guild");
const User = require("../../database/Schemas/User");

exports.run = async (client, message, args) => {
  Guild.findOne({ _id: message.guild.id }, async function (err, server) {

    if(!server.staff.some((x) => x === message.author.id)) return message.channel.send(`${message.author}, só Staff pode usar esse comando bobinho(a).`)

    let USER = message.guild.member(client.users.cache.get(args[0]) || message.mentions.members.first())
  
    if(!USER) return message.channel.send(`${message.author}, você deve mencionar/inserir o ID do membro primeiro.`)

    User.findOne({ _id: USER.id }, async function (err, user) {


            message.channel.send(`${message.author}, ok, passei o debug no membro.`)

            await User.findOneAndUpdate({_id: USER.id}, {$set: { 'addBot.haveSoli': false}})
    })
  })
};

exports.help = {
  name: "debug",
  aliases: [],
};
