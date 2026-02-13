const handler = async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, { text: 'لقد قمت بالضغط على زر نعم' }, { quoted: msg });
};

handler.command = ['yes'];

module.exports = handler;