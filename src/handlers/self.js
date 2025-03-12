module.exports = {
    command: 'self',
    description: 'Mengubah agar hanya owner yang dapat menggunakan robot ini',
    category: ['owner'],
    execute: async (sock, m) => {
        if (!sock.public) {
            return m.reply('Sudah self sebelumnya')
        }
        sock.public = false
        m.reply('Berhasil diubah ke mode self!')
    }
}