module.exports = {
    command: "ping",
    description: "Cek status bot.",
    execute: async (sock, m) => {
        await sock.sendMessage(m.key.remoteJid, { text: "Pong! 🏓" }, { quoted: m })
    }
}