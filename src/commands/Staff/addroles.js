const delay = (ms) => new Promise((res) => setTimeout(res, ms));

exports.run = async (client, message, args) => {
    
    if(message.author.id != process.env.OWNER_ID) return;

        message.guild.members.cache.map((member) => {
          
          member.roles.add(process.env.ROLE_ADD).catch((error) => {
              console.log(
                `ERRO ao setar mais tags, parando o sistema por 2 minutos.`
              );
              delay(15000 * 4);
            });

          console.log(
            `${member.user.tag} recebeu a TAG com sucesso!`
          );
        });

};

exports.help = {
  name: "addroles",
  aliases: [],
  category: "Staff",
  description: "Use este comando para aceitar um Bot/Comando",
  usage: "",
};
