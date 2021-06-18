const { MessageEmbed } = require("discord.js");
const Emojis = require("../../utils/Emojis");

module.exports = class Raw {
  constructor(client) {
    this.client = client;
  }

  async run(raw) {
    try {
      if (
        raw.t !== "MESSAGE_REACTION_ADD" &&
        raw.t !== "MESSAGE_REACTION_REMOVE"
      )
        return;

      const guild = this.client.guilds.cache.get(raw.d.guild_id);

      const server = await this.client.database.guilds.findOne({
        _id: guild.id,
      });

      const member = guild.members.cache.get(raw.d.user_id);
      const us = this.client.users.cache.get(raw.d.user_id);
      const user = await this.client.database.users.findOne({ _id: us.id });

      const msg = guild.channels.cache.get(server.ticket.channel);

      // ============================================ Starboard

      if (raw.t === "MESSAGE_REACTION_ADD") {
        const reaction = raw.d;
        const ch = await this.client.guilds.cache
          .get(reaction.guild_id)
          .channels.cache.get(reaction.channel_id)
          .messages.fetch(reaction.message_id);

        const rc = ch.reactions.cache.get("⭐");

        const handleStarboard = async () => {
          const starboard = this.client.channels.cache.find(
            (channel) => channel.name.toLowerCase() === "starboard"
          );
          const msgs = await starboard.messages.fetch({
            limit: 100,
          });
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

            const image = ch.attachments.first();

            if (image !== undefined) {
              EMBED.setImage(image.url);
            }

            if (starboard) starboard.send(`1 ⭐`, EMBED);
          }
        };

        if (reaction.emoji.name === "⭐") {
          if (
            !this.client.guilds.cache
              .get(reaction.guild_id)
              .channels.cache.find((x) => x.name.toLowerCase() === "starboard")
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
        const ch = await this.client.guilds.cache
          .get(reaction.guild_id)
          .channels.cache.get(reaction.channel_id)
          .messages.fetch(reaction.message_id);

        const rc = ch.reactions.cache.get("⭐");

        const handleStarboard2 = async () => {
          const starboard = this.client.channels.cache.find(
            (channel) => channel.name.toLowerCase() === "starboard"
          );
          const msgs = await starboard.messages.fetch({
            limit: 100,
          });
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
            !this.client.guilds.cache
              .get(reaction.guild_id)
              .channels.cache.find((x) => x.name.toLowerCase() === "starboard")
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
        if (raw.d.emoji.id === Emojis.reactions.Certo) {
          if (user.ticket.have)
            return msg
              .send(
                `${Emojis.Errado} - ${member}, você já possui um **TICKET** em aberto, por favor feche ele usando **z!ticket fechar**.`
              )
              .then((x) => x.delete({ timeout: 3000 }));
          msg
            .send(
              `${Emojis.Certo} - ${member}, vou criar seu **TICKET** e seu canal, um momento.`
            )
            .then((x) => x.delete({ timeout: 3000 }));
          setTimeout(async () => {
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
                  `${member}, olá, aqui está seu **TICKET**.\nAgora você pode tirar qualquer dúvida com minha **STAFF**, lembre-se de não abusar deste comando. ^^\n\n> Para fechar seu **TICKET** use: **${server.prefix}ticket fechar**.`
                );

                await this.client.database.users.findOneAndUpdate(
                  { _id: us.id },
                  {
                    $set: {
                      "ticket.have": true,
                      "ticket.channel": x.id,
                      "ticket.created": Date.now(),
                    },
                  }
                );
                await this.client.database.guilds.findOneAndUpdate(
                  { _id: guild.id },
                  {
                    $set: { "ticket.size": server.ticket.size + 1 },
                  }
                );
              });
          }, 5000);
        }
      }
    } catch (err) {
      if (err) console.error(err);
    }
  }
};
