const Guild = require("../../database/Schemas/Guild");

exports.run = async (client, message, args) => {

    Guild.findOne({ _id: message.guild.id }, async function (err, server) {

    if (message.author.id !== "600804786492932101") return;
    let USER = message.guild.member(client.users.cache.get(args[0]) || message.mentions.members.first())
    if(!USER) return message.channel.send(`${message.author}, você deve mencionar/inserir o ID do membro que deseja setar como Staff.`)
    if(server.staff.some((x) => x === USER.id)) {
        return message.channel.send(`${message.author}, o usuário já está setado como Staff.`)
    } else {


    message.channel.send(`${message.author}, ok, agora o usuário **${USER.user.tag}** tem permissões de Staff.`)

    await Guild.findByIdAndUpdate({_id: message.guild.id}, {$push: {staff: USER.id}})
}    
})
}

  
  exports.help = {
    name: "set",
    aliases: [],
    category: "Staff",
    description: "Use este comando para setar alguém como staff",
    usage: "set <user>"
  };
  