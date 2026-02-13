const handler = async (sock, msg) => {
    const buttons = [
        {buttonId: '.yes', buttonText: {displayText: 'نعم'}, type: 1},
        {buttonId: '.no', buttonText: {displayText: 'لا'}, type: 1}
    ]
    const buttonMessage = {
        text: "هل تعمل الأزرار؟",
        footer: 'اختر احد الخيارات',
        buttons: buttons,
        headerType: 1
    }
    await sock.sendMessage(msg.key.remoteJid, buttonMessage, { quoted: msg });
};

handler.command = ['تجربة'];

module.exports = handler;
