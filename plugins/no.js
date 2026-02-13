const handler = async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, { text: 'لقد قمت بالضغط على زر لا' }, { quoted: msg });
};

handler.command = ['no'];

module.exports = handler;