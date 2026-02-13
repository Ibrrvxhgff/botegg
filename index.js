const { default: makeWASocket, Browsers, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const readlineSync = require("readline-sync");
const pino = require("pino");
const NodeCache = require('node-cache');
const qrcode = require('qrcode-terminal');
const { loadPlugins } = require('./plugin-loader.js');

const BOT_SESSION_FOLDER = "./BotSession";
const BOT_CREDS_PATH = path.join(BOT_SESSION_FOLDER, "creds.json");
if (!fs.existsSync(BOT_SESSION_FOLDER)) fs.mkdirSync(BOT_SESSION_FOLDER);

if (!globalThis.conns || !(globalThis.conns instanceof Array)) globalThis.conns = [];
const reconectando = new Set();
let usarCodigo = false;
let numero = "";

let spamCount = 0;

setInterval(() => { spamCount = 0 }, 60 * 1000);

const origError = console.error;
console.error = (...args) => {
  if (args[0]?.toString().includes("Closing stale open session")) {
    spamCount++;
    if (spamCount > 50) {
      console.log("⚠️ Detectado loop de sesiones, reiniciando bot...");
      process.exit(1);
    }
  }
  origError(...args);
};

main();

async function main() {
const hayCredencialesPrincipal = fs.existsSync(BOT_CREDS_PATH);
const subbotsFolder = "./jadibot";
const haySubbotsActivos = fs.existsSync(subbotsFolder) && fs.readdirSync(subbotsFolder).some(folder => fs.existsSync(path.join(subbotsFolder, folder, "creds.json"))
);

if (!hayCredencialesPrincipal && !haySubbotsActivos) {
let lineM = '⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》'
const opcion = readlineSync.question(`╭${lineM}  
┊ ${chalk.blueBright('╭┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}
┊ ${chalk.blueBright('┊')} ${chalk.blue.bgBlue.bold.cyan('MÉTODO DE VINCULACIÓN')}
┊ ${chalk.blueBright('╰┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}   
┊ ${chalk.blueBright('╭┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}     
┊ ${chalk.blueBright('┊')} ${chalk.green.bgMagenta.bold.yellow('¿CÓMO DESEA CONECTARSE?')}
┊ ${chalk.blueBright('┊')} ${chalk.bold.redBright('⇢  Opción 1:')} ${chalk.greenBright('Código QR.')}
┊ ${chalk.blueBright('┊')} ${chalk.bold.redBright('⇢  Opción 2:')} ${chalk.greenBright('Código de 8 digitos.')}
┊ ${chalk.blueBright('╰┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}
┊ ${chalk.blueBright('╭┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}     
┊ ${chalk.blueBright('┊')} ${chalk.italic.magenta('Escriba sólo el número de')}
┊ ${chalk.blueBright('┊')} ${chalk.italic.magenta('la opción para conectarse.')}
┊ ${chalk.blueBright('╰┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')} 
╰${lineM}
${chalk.bold.magentaBright('---> ')}`)
usarCodigo = opcion === "2";
if (usarCodigo) {
console.log(chalk.yellow("Ingresa tu número (ej: +521234567890): "));
numero = readlineSync.question("").replace(/[^0-9]/g, '');
if (numero.startsWith('52') && !numero.startsWith('521')) {
numero = '521' + numero.slice(2);
}}
}

if (hayCredencialesPrincipal || !haySubbotsActivos) {
try {
await startBot();
} catch (err) {
console.error(chalk.red("❌ Error al iniciar bot principal:"), err);
}} else {
console.log(chalk.yellow("⚠️ Subbots activos detectados. Bot principal desactivado automáticamente."));
}}

async function startBot() {
const { state, saveCreds } = await useMultiFileAuthState(BOT_SESSION_FOLDER);
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 }); 
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });
const { version } = await fetchLatestBaileysVersion();
const commands = loadPlugins();

console.info = () => {};
console.debug = () => {};
const sock = makeWASocket({
logger: pino({ level: 'silent' }),   
browser: Browsers.macOS('Desktop'),
auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
},
markOnlineOnConnect: false, 
generateHighQualityLinkPreview: true, 
syncFullHistory: false,
getMessage: async () => ( "" ),
msgRetryCounterCache: msgRetryCounterCache || new Map(),
userDevicesCache: userDevicesCache || new Map(),
defaultQueryTimeoutMs: undefined,
cachedGroupMetadata: async (jid) => groupCache.get(jid),
version: version, 
defaultQueryTimeoutMs: 30_000,
keepAliveIntervalMs: 55000, 
maxIdleTimeMs: 60000, 
});

globalThis.conn = sock;
sock.ev.on("creds.update", saveCreds);

sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
const code = lastDisconnect?.error?.output?.statusCode || 0;

if(qr) {
  qrcode.generate(qr, {small: true});
}

if (connection === "open") {
console.log(chalk.bold.greenBright(`
▣─────────────────────────────···
│
│❧ 𝙲𝙾𝙽𝙴𝙲𝚃𝙰𝙳𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙰𝙼𝙴𝙽𝚃𝙴 𝙰𝙻 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿 ✅
│
▣─────────────────────────────···`))
}

if (connection === "close") {
if ([401, 440, 428, 405].includes(code)) {      
console.log(chalk.red(`❌ Error de sesión (${code}) inválida. Borra la carpeta "BotSession" y vuelve a conectar.`));
}
console.log(chalk.yellow("♻️ Conexión cerrada. Reintentando en 3s..."));
setTimeout(() => startBot(), 3000);
}});

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);
  
if (usarCodigo && !state.creds.registered) {
setTimeout(async () => {
try {
const code = await sock.requestPairingCode(numero);
console.log(chalk.yellow('Código de emparejamiento:'), chalk.greenBright(code));
} catch {}
}, 2000);
}

sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
        if (!msg.message) continue;
        if (msg.messageTimestamp && (Date.now() / 1000 - msg.messageTimestamp > 120)) continue;
        if (msg.key.id.startsWith('NJX-') || msg.key.id.startsWith('Lyru-') || msg.key.id.startsWith('EvoGlobalBot-') || msg.key.id.startsWith('BAE5') && msg.key.id.length === 16 || msg.key.id.startsWith('3EB0') && msg.key.id.length === 12 || msg.key.id.startsWith('3EB0') || msg.key.id.startsWith('3E83') || msg.key.id.startsWith('3E38') && (msg.key.id.length === 20 || msg.key.id.length === 22) || msg.key.id.startsWith('B24E') || msg.key.id.startsWith('8SCO') && msg.key.id.length === 20 || msg.key.id.startsWith('FizzxyTheGreat-')) return

        const buttonResponse = msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.templateButtonReplyMessage?.selectedId;
        const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

        let commandName = '';
        let isCmd = false;

        if (buttonResponse) {
            commandName = buttonResponse.trim().split(/ +/).shift().toLowerCase();
            isCmd = true;
        } else if (textMessage.startsWith('.')) {
            commandName = textMessage.slice(1).trim().split(/ +/).shift().toLowerCase();
            isCmd = true;
        }

        if (isCmd) {
            const command = commands.get(commandName);
            if (command) {
                try {
                    await command(sock, msg);
                } catch (err) {
                    console.error(`Error executing command ${commandName}:`, err);
                }
            }
        }
    }
});
  
sock.ev.on("call", async (calls) => {
try {
for (const call of calls) {
}} catch (err) {
console.error(chalk.red("❌ Error procesando call.update:"), err);
}
});
    
setInterval(() => {
const tmp = './tmp';
try {
if (!fs.existsSync(tmp)) return;
const files = fs.readdirSync(tmp);
files.forEach(file => {
if (file.endsWith('.file')) return;
const filePath = path.join(tmp, file);
const stats = fs.statSync(filePath);
const now = Date.now();
const modifiedTime = new Date(stats.mtime).getTime();
const age = now - modifiedTime;
if (age > 3 * 60 * 1000) {
fs.unlinkSync(filePath);
}
})
} catch (err) {
console.error('Error cleaning temporary files:', err);
}}, 30 * 1000);
        
setInterval(() => {
console.log('♻️ Reiniciando bot automáticamente...');
process.exit(0); 
}, 10800000)

setInterval(() => {
  const now = Date.now();
  const carpetas = ['./jadibot', './BotSession'];
  for (const basePath of carpetas) {
    if (!fs.existsSync(basePath)) continue;

    const subfolders = fs.readdirSync(basePath);
    for (const folder of subfolders) {
      const sessionPath = path.join(basePath, folder);
      if (!fs.statSync(sessionPath).isDirectory()) continue;
      const isActive = globalThis.conns?.some(c => c.userId === folder || c.user?.id?.includes(folder));
      const files = fs.readdirSync(sessionPath);

      const prekeys = files.filter(f => f.startsWith("pre-key"));
      if (prekeys.length > 500) {
        prekeys
          .sort((a, b) => fs.statSync(path.join(sessionPath, a)).mtimeMs - fs.statSync(path.join(sessionPath, b)).mtimeMs)
          .slice(0, prekeys.length - 300)
          .forEach(pk => {
            fs.unlinkSync(path.join(sessionPath, pk));
          });
      }

      for (const file of files) {
        const fullPath = path.join(sessionPath, file);
        if (!fs.existsSync(fullPath)) continue;
        if (file === 'creds.json') continue;
        try {
          const stats = fs.statSync(fullPath);
          const ageMs = now - stats.mtimeMs;

          if (file.startsWith('pre-key') && ageMs > 24 * 60 * 60 * 1000 && !isActive) {
            fs.unlinkSync(fullPath);
          } else if (ageMs > 30 * 60 * 1000 && !isActive) {
            fs.unlinkSync(fullPath);
          }
        } catch (err) {
          console.error(chalk.red(`[⚠] Error al limpiar archivo ${file}:`), err);
        }
      }
    }
  }
  console.log(chalk.bold.cyanBright(`
╭» 🟠 ARCHIVOS 🟠
│→ Sesiones y pre-keys viejas limpiadas
╰―――――――――――――――――――――――――――――― 🗑️♻️`));
}, 10 * 60 * 1000);
    
function setupGroupEvents(sock) {
sock.ev.on("group-participants.update", async (update) => {
console.log(update)
try {
} catch (err) {
console.error(chalk.red("❌ Error procesando group-participants.update:"), err);
}});

sock.ev.on("groups.update", async (updates) => {
console.log(updates)
try {
for (const update of updates) {
}} catch (err) {
console.error(chalk.red("❌ Error procesando groups.update:"), err);
}});
}
}
