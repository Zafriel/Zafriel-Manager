const SLEEP = async () => {
  return Number(60000 * 10);
};
const Client = require("../../database/Schemas/Client");
const moment = require("moment");
require("moment-duration-format");

module.exports = (client) => {
  setInterval(() => {
    client.channels.cache
      .get("829521984869105705")
      .send("https://zafriel.glitch.me/");
  }, 20000);
  client.user.setStatus("dnd");
  const timeOut = (ms) => setTimeout(UPDATE_CHANNEL, ms);
  /*setInterval(async() => {
    const bot = await Client.findOne({ _id: client.user.id });
    const target_time = new Date("2021-04-01 00:00:00");
  
    const time = moment
      .duration(target_time - (Date.now() - 1.08e7))
      .format("d [dias] h [horas] m [minutos] e s [segundos]")
      .replace("minsutos", "minutos");
  
    if (bot.channel_log == "null") {
      return client.channels.fetch("821154351799074887").then(async (x) => {
        x.send(
          `Tempo até o grande Reset do **Zafriel**\n\n> Tempo: **${time}**`
        ).then(async (f) => {
          await Client.findOneAndUpdate(
            { _id: client.user.id },
            { $set: { channel_log: f.id } }
          );
        });
      });
    } else {
      client.channels.cache
        .get("821154351799074887")
        .messages.fetch(bot.channel_log)
        .then((x) => {
          x.edit(
            `Tempo até o grande Reset do **Zafriel**\n\n> Tempo: **${time}**`
          );
        });
    }
  }, 15000)*/
  const UPDATE_CHANNEL = async () => {
    require("mongoose")
      .connection.collection("users")
      .updateMany({}, { $set: { help: false } }, { multi: true });

    return timeOut(await SLEEP());
  };

  return timeOut();
};
