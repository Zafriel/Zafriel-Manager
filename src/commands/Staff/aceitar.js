const Guild = require("../../database/Schemas/Guild");
const User = require("../../database/Schemas/User");

exports.run = async (client, message, args) => {
  Guild.findOne({ _id: message.guild.id }, async function (err, server) {

    if(!server.staff.some((x) => x === message.author.id)) return message.channel.send(`${message.author}, só Staff pode usar esse comando bobinho(a).`)

    let USER = message.guild.member(client.users.cache.get(args[0]) || message.mentions.members.first())
  
    if(!USER) return message.channel.send(`${message.author}, você deve mencionar/inserir o ID do membro primeiro.`)

    User.findOne({ _id: USER.id }, async function (err, user) {

        if(!user.addBot.haveSoli){
            return message.channel.send(`${message.author}, este membro não tem uma solicitação de Bot ativa.`)
        } else {
            await client.users.fetch(user.addBot.idBot).then(async(x) => {
            client.channels.cache.get("791053992276393994").send(`<:online2:687577310278320142> ${USER} seu Bot **\`${x.username}\`** foi aceito pelo Staff **${message.author}**.`)
            await User.findOneAndUpdate({_id: USER.id}, {$set: { 'addBot.haveSoli': true, 'addBot.haveBot': true, 'addBot.acceptBy': message.author.tag, 'addBot.acceptIn': Date.now() }})
            message.channel.send(`${message.author}, bot aceito com sucesso!`)
            USER.roles.add(process.env.DEV_ROLE)
          })
          }
    });
  });
};

exports.help = {
  name: "aceitar",
  aliases: [],
  category: "Staff",
  description: "Use este comando para aceitar um Bot/Comando",
  usage: "aceitar <cmd/bot> <id>"
};
