const fs = require('fs')
const path = require('path')

module.exports = {
    command: "menu",
    description: "Menampilkan daftar perintah yang tersedia.",
    category: ['main'],
    execute: async (sock, m) => {
        const pluginFiles = fs.readdirSync(path.join(__dirname, '../handlers')).filter(file => file.endsWith('.js'))

        let categorizedCommands = {}

        for (const file of pluginFiles) {
            const pluginPath = path.join(__dirname, '../handlers', file)
            delete require.cache[require.resolve(pluginPath)]
            const plugin = require(pluginPath)

            if (plugin.command && plugin.description) {
                const categories = plugin.category || ["main"]
                
                categories.forEach(category => {
                    if (!categorizedCommands[category]) {
                        categorizedCommands[category] = []
                    }
                    categorizedCommands[category].push(plugin)
                })
            }
        }

        let menuText = `*📜 MushBot Beta*
🚀 Versi uji coba – Gunakan perintah berikut untuk mengeksplorasi fitur yang tersedia!\n\n`

        const categoryTitles = {
            main: "📌 MAIN MENU",
            owner: "👑 OWNER MENU",
            admin: "🛡️ ADMIN MENU",
            group: "👥 GROUP MENU",
            game: "🎮 GAME MENU",
            premium: "💎 PREMIUM MENU",
            other: "📂 OTHER MENU"
        }

        Object.keys(categorizedCommands).forEach(category => {
            const title = categoryTitles[category] || categoryTitles.other
            menuText += `*${title}*\n`

            categorizedCommands[category].forEach((plugin, index) => {
                menuText += `${index + 1}. *${plugin.command}* - ${plugin.description}`
                
                if (plugin.ownerOnly) menuText += " (🔒 Owner Only)"
                if (plugin.adminOnly) menuText += " (🛡️ Admin Only)"
                if (plugin.groupOnly) menuText += " (👥 Group Only)"
                if (plugin.privateOnly) menuText += " (📩 Private Only)"
                if (plugin.premiumOnly) menuText += " (💎 Premium Only)"
                
                menuText += "\n"
            })

            menuText += "\n"
        })

        await sock.sendMessage(m.key.remoteJid, { text: menuText.trim() }, { quoted: m })
    }
}