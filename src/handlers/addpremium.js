module.exports = {
    command: "addpremium",
    description: "Menambahkan pengguna ke premium",
    category: ['owner'],
    ownerOnly: true,
    execute: async (sock, m) => {
        const sender = m.key.participant || m.key.remoteJid
        const args = m.args

        if (!args || args.length === 0) {
            return sock.sendMessage(m.key.remoteJid, { text: "Masukkan nomor yang ingin dijadikan premium!" }, { quoted: m })
        }

        const user = args[0].replace(/[^0-9]/g, "")

        if (!db.premium) db.premium = []

        if (db.premium.includes(user)) {
            return sock.sendMessage(m.key.remoteJid, { text: `${user} sudah menjadi pengguna premium!` }, { quoted: m })
        }

        db.premium.push(user)

        sock.sendMessage(m.key.remoteJid, { text: `🎉 ${user} berhasil ditambahkan ke daftar premium!` }, { quoted: m })
    }
}