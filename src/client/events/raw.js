const User = require("../../database/Schemas/User");
const Guild = require("../../database/Schemas/Guild");
const { MessageEmbed } = require("discord.js");

module.exports = async (client, raw) => {
  try {
    if (raw.t !== "MESSAGE_REACTION_ADD" && raw.t !== "MESSAGE_REACTION_REMOVE")
      return;

    const guild = client.guilds.cache.get(raw.d.guild_id);

    Guild.findOne({ _id: guild.id }, async (err, server) => {
      const member = guild.members.cache.get(raw.d.user_id);
      const us = client.users.cache.get(raw.d.user_id);
      const msg = guild.channels.cache.get(server.ticket.channel);

      User.findOne({ _id: us.id }, async (err, user) => {
        Guild.findOne({ _id: guild.id }, async (err, server) => {
          // ============================================ Starboard

          if (raw.t === "MESSAGE_REACTION_ADD") {
            const reaction = raw.d;
            const ch = await client.guilds.cache
              .get(reaction.guild_id)
              .channels.cache.get(reaction.channel_id)
              .messages.fetch(reaction.message_id);

            const rc = ch.reactions.cache.get("⭐");

            const handleStarboard = async () => {
              const starboard = client.channels.cache.find(
                (channel) => channel.name.toLowerCase() === "starboard"
              );
              const msgs = await starboard.messages.fetch({ limit: 100 });
              const existingMsg = msgs.find((msg) =>
                msg.embeds.length === 1
                  ? msg.embeds[0].footer.text.startsWith(ch.id)
                    ? true
                    : false
                  : false
              );

              if (existingMsg) existingMsg.edit(`${rc.count} ⭐`);
              else {
                const EMBED = new MessageEmbed()
                  .setAuthor(ch.author.tag, ch.author.displayAvatarURL())
                  .setFooter(reaction.message_id)
                  .setThumbnail(
                    ch.author.displayAvatarURL({
                      format: "jpg",
                      dynamic: true,
                      size: 2048,
                    })
                  )
                  .setDescription(`[Mensagem](${ch.url})\n\n${ch.content}`)
                  .setColor(process.env.EMBED_COLOR)
                  .setTimestamp();
                if (starboard) starboard.send(`1 ⭐`, EMBED);
              }
            };

            if (reaction.emoji.name === "⭐") {
              if (
                !client.guilds.cache
                  .get(reaction.guild_id)
                  .channels.cache.find(
                    (x) => x.name.toLowerCase() === "starboard"
                  )
              )
                return;
              if (ch.partial) {
                await reaction.fetch();
                ch;
                handleStarboard();
              } else {
                handleStarboard();
              }
            }
          }

          if (raw.t === "MESSAGE_REACTION_REMOVE") {
            const reaction = raw.d;
            const ch = await client.guilds.cache
              .get(reaction.guild_id)
              .channels.cache.get(reaction.channel_id)
              .messages.fetch(reaction.message_id);

            const rc = ch.reactions.cache.get("⭐");

            const handleStarboard2 = async () => {
              const starboard = client.channels.cache.find(
                (channel) => channel.name.toLowerCase() === "starboard"
              );
              const msgs = await starboard.messages.fetch({ limit: 100 });
              const existingMsg = msgs.find((msg) =>
                msg.embeds.length === 1
                  ? msg.embeds[0].footer.text.startsWith(ch.id)
                    ? true
                    : false
                  : false
              );

              if (existingMsg) {
                if (String(rc) === "undefined")
                  existingMsg.delete({ timeout: 2500 });
                else existingMsg.edit(`${rc.count} ⭐`);
              }
            };

            if (reaction.emoji.name === "⭐") {
              if (
                !client.guilds.cache
                  .get(reaction.guild_id)
                  .channels.cache.find(
                    (x) => x.name.toLowerCase() === "starboard"
                  )
              )
                return;
              if (ch.partial) {
                await reaction.fetch();
                ch;
                handleStarboard2();
              } else {
                handleStarboard2();
              }
            }
          }

          // ============================================ Starboard

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
  } catch (err) {
    if (err) console.error(err);
  }
};
