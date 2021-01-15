exports.run = async (client, message, args) => {
  if (message.author.id !== "600804786492932101") return;

  if (!args[0])
    return message.channel.send(
      `${message.author}, insira o nome do comando/aliases.`
    );

  var cmd =
    client.commands.get(args[0]) ||
    client.commands.find(
      (a) => a.help && a.help.aliases && a.help.aliases.includes(args[0])
    );

  if (!cmd) {
    return message.channel.send(
      `${message.author}, não achei nenhum comando com este nome/aliases.`
    );
  } else {
    client.commands.delete(cmd.help.name);

    let props = require(`../${cmd.help.category}/${cmd.help.name}.js`);
    delete require.cache[
      require.resolve(`../${cmd.help.category}/${cmd.help.name}.js`)
    ];

    client.commands.set(cmd.help.name, props);

    message.channel.send(
      `${message.author}, reiniciei o comando **${cmd.help.name}** com sucesso.`
    );
  }
};

exports.help = {
  name: "reload",
  aliases: ["r"],
  category: "Staff",
  description: "Use este comando para reiniciar algum comando",
  usage: "reload <cmd name/aliases>"
};
