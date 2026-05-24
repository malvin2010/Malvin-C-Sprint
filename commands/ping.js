module.exports = {
  name: 'ping',
  description: 'Check if bot is alive',
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: 'Pong! Malvin C Sprint is online 🏓'
    });
  }
};
