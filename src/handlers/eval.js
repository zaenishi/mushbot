module.exports = {
    command: ">",
    description: "Menjalankan kode JavaScript secara langsung",
    category: ['owner'],
    noprefix: true,
    ownerOnly: true,
    execute: async (sock, m) => {
        const args = m.args
        if (!args.length) return sock.sendMessage(m.key.remoteJid, { text: " Harap masukkan kode untuk dieksekusi!" }, { quoted: m })

        try {
            let code = args.join(" ")
            if (code.includes("process.env") || code.includes("fs.") || code.includes("child_process")) {
                return sock.sendMessage(m.key.remoteJid, { text: "Akses ke lingkungan sistem dibatasi!" }, { quoted: m })
            }

            let result = await eval(`(async () => { ${code} })()`)
            if (typeof result !== "string") result = require("util").inspect(result)

            await sock.sendMessage(m.key.remoteJid, { text: `\n\`\`\`${result}\`\`\`` }, { quoted: m })
        } catch (err) {
            await sock.sendMessage(m.key.remoteJid, { text: `\n\`\`\`${err}\`\`\`` }, { quoted: m })
        }
    }
}