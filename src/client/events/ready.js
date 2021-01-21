const SLEEP = async () => {
  return Number(60000 * 10);
};

module.exports = (client) => {


  const timeOut = (ms) => setTimeout(UPDATE_CHANNEL, ms);
  const UPDATE_CHANNEL = async () => {
    require("mongoose")
      .connection.collection("users")
      .updateMany({}, { $set: { help: false } }, { multi: true });

    return timeOut(await SLEEP());
  };

  return timeOut();
};
