module.exports = {
    command: "delpremium",
    description: 'Menghapus pengguna dari premium',
    category: ['owner'],
    ownerOnly: true,
    execute: async (sock, m) => {
        const sender = m.key.participant || m.key.remoteJid
        const args = m.args
        
        if (args.length === 0) return sock.sendMessage(m.key.remoteJid, { text: "Masukkan nomor yang ingin dihapus dari premium!" }, { quoted: m })

        const user = args[0].replace(/[^0-9]/g, "")
        if (!db.premium) db.premium = []                
        if (!db.premium.includes(user)) {
            return sock.sendMessage(m.key.remoteJid, { text: `${user} tidak ada dalam daftar premium!` }, { quoted: m })
        }

        db.premium = db.premium.filter(p => p !== user)
        sock.sendMessage(m.key.remoteJid, { text: `${user} berhasil dihapus dari daftar premium!` }, { quoted: m })
    }
}