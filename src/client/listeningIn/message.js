const GetMention = (id) => new RegExp(`^<@!?${id}>( |)$`);
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");
const coldoown = new Set();

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(message) {
    try {
      const server = await this.client.database.guilds.findOne({
        _id: message.guild.id,
      });
      const user = await this.client.database.users.findOne({
        _id: message.author.id,
      });
      const client = await this.client.database.clientUtils.findOne({
        _id: this.client.user.id,
      });

      if (message.author.bot == true) return;

      if (!user)
        await this.client.database.users.create({ _id: message.author.id });

      if (!server)
        await this.client.database.guilds.create({ _id: message.guild.id });

      if (!client)
        await this.client.database.clientUtils.create({
          _id: this.client.user.id,
          reason: "",
          manutenção: false,
        });

      var prefix = prefix;
      prefix = server.prefix;

      if (message.content.match(GetMention(this.client.user.id))) {
        const EMBED_MENTION = new ClientEmbed(this.client.user)
          .setTitle(`${Emojis.Help} Precisando de Ajuda?`)
          .setDescription(
            `${message.author}, caso esteja precisando de ajuda basta usar **${prefix}ajuda** ou então basta ir no canal <#801852707051929620> e criar seu Ticket.`
          )
          .setTimestamp()
          .setThumbnail(
            message.author.displayAvatarURL({
              dynamic: true,
              format: "jpg",
              size: 2048,
            })
          )
          .setFooter(`Mencionado pelo(a) ${message.author.tag}`);

        return message.channel.send(EMBED_MENTION);
      }

      if (message.content.indexOf(prefix) !== 0) return;
      const author = message.author;
      const args = message.content.slice(prefix.length).trim().split(/ +/g);
      const command = args.shift().toLowerCase();
      const cmd =
        this.client.commands.get(command) ||
        this.client.commands.get(this.client.aliases.get(command));

      if (!cmd) return;
      if (coldoown.has(message.author.id))
        return message.channel.send(
          `${message.author}, você deve aguardar **5 segundos** para usar outro comando.`
        );

      const comando = await this.client.database.commands.findOne({
        _id: cmd.name,
      });

      if (comando) {
        if (message.author.id !== process.env.OWNER_ID) {
          if (comando.manutenção)
            return message.quote(
              `${message.author}, o comando **\`${cmd.name}\`** está em manutenção no momento.\nMotivo: **${comando.reason}**`
            );

          if (client.manutenção) {
            return message.quote(
              `${message.author}, no momento eu me encontro em manutenção, tente novamente mais tarde.\nMotivo: **${client.reason}**`
            );
          }
        }
        if (client.blacklist.some((x) => x == message.author.id)) {
          return message.quote(
            `${message.author}, você não pode me usar no momento. **\`Lista Negra\`**.`
          );
        }

        const cb = server.cmdblock;

        if (cb.status) {
          if (!cb.cmds.some((x) => x === cmd.name)) {
            if (!cb.channels.some((x) => x === message.channel.id)) {
              if (!message.member.hasPermission("MANAGE_MESSAGES")) {
                return message.channel.send(cb.msg);
              }
            }
          }
        }

        cmd.run(message, args, prefix, author, language);
        var num = comando.usages;
        num = num + 1;

        if (!["600804786492932101"].includes(message.author.id)) {
          coldoown.add(message.author.id);
          setTimeout(() => {
            coldoown.delete(message.author.id);
          }, 5000);
        }
        await this.client.database.commands.findOneAndUpdate(
          { _id: cmd.name },
          { $set: { usages: num } }
        );
      } else {
        await this.client.database.commands.create({
          _id: cmd.name,
          usages: 1,
          manutenção: false,
        });
        console.log(
          `O comando ${cmd.name} teve seu documento criado com sucesso.`
        );
      }
    } catch (err) {
      if (err) console.error(err);
    }
  }
};
