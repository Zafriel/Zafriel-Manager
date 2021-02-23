const User = require("../../database/Schemas/User");
const Guild = require("../../database/Schemas/Guild");

module.exports = async (client, raw) => {
  if (raw.t !== "MESSAGE_REACTION_ADD") return;

  const guild = client.guilds.cache.get(raw.d.guild_id);

  Guild.findOne({ _id: guild.id }, async (err, server) => {
    const member = guild.members.cache.get(raw.d.user_id);
    const us = client.users.cache.get(raw.d.user_id);
    const msg = guild.channels.cache.get(server.ticket.channel);

    User.findOne({ _id: us.id }, async (err, user) => {
      Guild.findOne({ _id: guild.id }, async (err, server) => {
        if (raw.d.message_id != server.ticket.msg) return;

        if (raw.t === "MESSAGE_REACTION_ADD") {
          if (raw.d.emoji.name === "✅") {
            if (user.ticket.have)
              return msg
                .send(
                  `${member}, você já possui um **TICKET** em aberto, por favor feche ele usando **z!ticket fechar**.`
                )
                .then((x) => x.delete({ timeout: 3000 }));
            msg
              .send(
                `${member}, estou criando seu **TICKET**, por favor aguarde um momento.`
              )
              .then((x) => x.delete({ timeout: 3000 }));
            setTimeout(async (f) => {
              guild.channels
                .create(`${server.ticket.size + 1}-${member.user.tag}`, {
                  type: "text",
                  permissionOverwrites: [
                    {
                      id: member.id,
                      allow: [
                        "VIEW_CHANNEL",
                        "READ_MESSAGE_HISTORY",
                        "USE_EXTERNAL_EMOJIS",
                      ],
                      deny: "ADD_REACTIONS",
                    },
                    {
                      id: guild.id,
                      deny: "VIEW_CHANNEL",
                    },

                    {
                      id: "751976733208739941",
                      allow: "VIEW_CHANNEL",
                      deny: "ADD_REACTIONS",
                    },
                  ],
                })
                .then(async (x) => {
                  x.send(
                    `${member}, olá, aqui está seu **TICKET**.\nAgora você pode tirar qualquer dúvida com minha **STAFF**, lembre-se de não abusar deste comando. ^^\n\n> Para fechar seu **TICKET** use: **z!ticket fechar**.`
                  );

                  await User.findOneAndUpdate(
                    { _id: us.id },
                    {
                      $set: {
                        "ticket.have": true,
                        "ticket.channel": x.id,
                        "ticket.created": Date.now(),
                      },
                    }
                  );
                  await Guild.findOneAndUpdate(
                    { _id: guild.id },
                    { $set: { "ticket.size": server.ticket.size + 1 } }
                  );
                });
            }, 5000);
          }
        }
      });
    });
  });
  try {
  } catch (err) {
    if (err) console.error(err);
  }
};
