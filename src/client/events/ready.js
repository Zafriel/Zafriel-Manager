const SLEEP = async () => {
  return Number(60000 * 10);
};

module.exports = (client) => {
  const status = [
    {
      name: "Bot Tutorial",
    },
    {
      name: "Desenvolvido em JavaScript",
    },
  ];

  function setStats() {
    var randomStatus = status[Math.floor(Math.random() * status.length)];
    client.user.setActivity(randomStatus.name);
  }

  client.user.setStatus("dnd");

  setStats();
  setInterval(() => {
    setStats();
  }, 10 * 1000);

  const timeOut = (ms) => setTimeout(UPDATE_CHANNEL, ms);
  const UPDATE_CHANNEL = async () => {
    require("mongoose")
      .connection.collection("users")
      .update({}, { $set: { help: false } }, { multi: true });

    return timeOut(await SLEEP());
  };

  return timeOut();
};
