module.exports = {
    command: "listpremium",
    description: "Melihat semua pengguna premium",
    category: ['main'],
    ownerOnly: true, 
    execute: async (sock, m) => {
        if (!db.premium) db.premium = []    
        const list = db.premium.length > 0 ? db.premium.join("\n") : "Belum ada pengguna premium."
        sock.sendMessage(m.key.remoteJid, { text: `💎 *Daftar Pengguna Premium:*\n${list}` }, { quoted: m })
    }
}