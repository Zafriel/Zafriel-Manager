const Guild = require("../../database/Schemas/Guild");
const User = require("../../database/Schemas/User");

exports.run = async (client, message, args) => {
  Guild.findOne({ _id: message.guild.id }, async function (err, server) {
    if(!server.staff.some((x) => x === message.author.id)) return message.channel.send(`${message.author}, só Staff pode usar esse comando bobinho(a).`)

    let USER = message.guild.member(client.users.cache.get(args[0]) || message.mentions.members.first())

    let motivo = args.slice(1).join(" ")
  
    if(!USER) return message.channel.send(`${message.author}, você deve mencionar/inserir o ID do membro primeiro.`)

    User.findOne({ _id: USER.id }, async function (err, user) {

        if(!user.addBot.haveSoli){
            return message.channel.send(`${message.author}, este membro não tem uma solicitação de Bot ativa.`)
        } else if(!motivo) {
            return message.channel.send(`${message.author}, você deve inserir o motivo para recusar a solicitação do usuário.`)
        } else {
            await client.users.fetch(user.addBot.idBot).then(async(x) => {
            client.channels.cache.get("791053992276393994").send(`<:dnd:687577184092946467> ${USER} seu Bot **\`${x.username}\`** foi recusado pelo Staff **${message.author}**.\n\`\`\`js\n" ${motivo} "\`\`\``)
            await User.findOneAndUpdate({_id: USER.id}, {$set: { 'addBot.haveSoli': false, 'addBot.idBot': "null" }})
            message.channel.send(`${message.author}, bot recusado com sucesso!`)
          })
          }
    });
  });
};

exports.help = {
  name: "recusar",
  aliases: [],
  category: "Staff"
};
