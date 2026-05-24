module.exports = {
  name: 'balance',
  aliases: ['bal', 'money'],
  description: 'Check your wallet and bank balance',
  async execute(sock, msg) {
    const user = msg.key.participant || msg.key.remoteJid;
    // Replace with your DB. For now use a simple JSON file
    const db = require('../../db.json');
    const userData = db[user] || { wallet: 0, bank: 0 };
    await sock.sendMessage(msg.key.remoteJid, {
      text: `💰 *Balance*\n\nWallet: $${userData.wallet}\nBank: $${userData.bank}\nTotal: $${userData.wallet + userData.bank}`
    });
  }
};
