const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
const Guild = require("../../database/Schemas/Guild");
const User = require("../../database/Schemas/User");

exports.run = async (client, message, args) => {
  moment.locale("pt-BR");

  let USER = message.guild.member(
    client.users.cache.get(args[0]) ||
      message.mentions.members.first() ||
      message.author
  );

  if (!USER)
    return message.channel.send(
      `${message.author}, você deve mencionar/inserir o ID do membro que deseja saber as informações.`
    );

  Guild.findOne({ _id: message.guild.id }, async function (err, server) {
    User.findOne({ _id: USER.id }, async function (err, user) {
      if (!user.addBot.haveBot)
        return message.channel.send(
          `${message.author}, este membro não possui nenhum Bot adicionado no servidor.`
        );

      let EMBED = new Discord.MessageEmbed()
        .setAuthor(`Informações do Not do usuário ${USER.user.tag}`)
        .addFields(
          {
            name: `Nome`,
            value: `${client.users.cache.get(user.addBot.idBot).username}`,
          },
          {
            name: "ID do Bot",
            value: user.addBot.idBot,
          },
          {
            name: "Bot aceito por",
            value: user.addBot.acceptBy,
          },
          {
            name: "Aceito em",
            value: `${moment(user.addBot.acceptIn).format("L")} ( há **${String(
              moment
                .duration(Date.now() - user.addBot.acceptIn)
                .format("M [meses] d [dias] h [horas] m [minutos] s [segundos]")
            ).replace("minsutos", "minutos")}** )`,
          }
        )
        .setThumbnail(USER.user.displayAvatarURL({ dynamic: true }))
        .setColor(process.env.EMBED_COLOR);

      message.channel.send(EMBED);
    });
  });
};
exports.help = {
  name: "info",
  aliases: [],
  category: "Utils"
};
