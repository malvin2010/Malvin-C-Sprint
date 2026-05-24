require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

const BOT_NAME = 'Malvin C Sprint';
const PREFIX = '.';
const commands = new Map();
const PHONE_NUMBER = process.env.PHONE_NUMBER;

const loadCommands = () => {
  const cmdPath = path.join(__dirname, 'commands');
  if (!fs.existsSync(cmdPath)) fs.mkdirSync(cmdPath);
  const files = fs.readdirSync(cmdPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const cmd = require(path.join(cmdPath, file));
    commands.set(cmd.name, cmd);
  }
  console.log(`Loaded ${commands.size} commands`);
};

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: [BOT_NAME, 'Chrome', '1.0.0']
  });

  if (!sock.authState.creds.registered) {
    if (!PHONE_NUMBER) {
      console.error('ERROR: Set PHONE_NUMBER in environment variables first!');
      process.exit(1);
    }
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(PHONE_NUMBER);
        console.log(`\n=================================`);
        console.log(`Malvin C Sprint Pairing Code: ${code}`);
        console.log(`Go to WhatsApp > Linked Devices > Link with phone number`);
        console.log(`=================================\n`);
      } catch (err) {
        console.error('Failed to get pairing code:', err);
      }
    }, 3000);
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    }
    if (connection === 'open') console.log(`${BOT_NAME} connected!`);
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    if (!text.startsWith(PREFIX)) return;

    const args = text.slice(PREFIX.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const cmd = commands.get(cmdName);
    if (!cmd) return;

    try {
      await cmd.execute(sock, msg, args);
    } catch (err) {
      console.error(err);
    }
  });

  return sock;
}

async function start() {
  loadCommands();
  await startBot();
}

start();
