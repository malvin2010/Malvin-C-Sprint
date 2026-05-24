module.exports = {
  name: 'transfer',
  aliases: ['pay', 'send'],
  async execute(sock, msg, args) {
    const sender = msg.key.participant || msg.key.remoteJid;
    const receiver = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const amount = parseInt(args[0]);
    
    if (!receiver ||!amount || amount <= 0) return sock.sendMessage(msg.key.remoteJid, { text: 'Usage:.transfer @user 500' });
    
    const db = require('../../db.json');
    if (!db[sender] || db[sender].wallet < amount) return sock.sendMessage(msg.key.remoteJid, { text: 'Not enough money' });
    
    db[sender].wallet -= amount;
    if (!db[receiver]) db[receiver] = { wallet: 0, bank: 0 };
    db[receiver].wallet += amount;
    require('fs').writeFileSync('./db.json', JSON.stringify(db, null, 2));
    
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ Transferred $${amount} to @${receiver.split('@')[0]}`, mentions: [receiver] });
  }
};
