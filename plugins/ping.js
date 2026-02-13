const handler = async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, { text: 'بونج' }, { quoted: msg });
};

handler.command = ['بينج'];

module.exports = handler;