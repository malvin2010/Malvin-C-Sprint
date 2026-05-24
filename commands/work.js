module.exports = {
  name: 'work',
  description: 'Work to earn money every 1 hour',
  cooldown: 3600000, // 1 hour in ms
  async execute(sock, msg) {
    const user = msg.key.participant || msg.key.remoteJid;
    const db = require('../../db.json');
    if (!db[user]) db[user] = { wallet: 0, bank: 0, lastWork: 0 };
    
    if (Date.now() - db[user].lastWork < this.cooldown) {
      const timeLeft = Math.ceil((this.cooldown - (Date.now() - db[user].lastWork)) / 60000);
      return sock.sendMessage(msg.key.remoteJid, { text: `⏰ Come back in ${timeLeft} minutes` });
    }
    
    const earn = Math.floor(Math.random() * 500) + 100;
    db[user].wallet += earn;
    db[user].lastWork = Date.now();
    require('fs').writeFileSync('./db.json', JSON.stringify(db, null, 2));
    
    await sock.sendMessage(msg.key.remoteJid, { text: `💼 You worked and earned $${earn}!` });
  }
};
