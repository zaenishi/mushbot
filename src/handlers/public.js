module.exports = {
    command: 'public',
    description: 'Mengubah agar semua orang bisa menggunakan robot ini',
    category: ['owner'],
    execute: async (sock, m) => {
        if (sock.public) {
            return m.reply('Sudah public sebelumnya')
        }
        sock.public = true
        m.reply('Berhasil diubah ke mode public!')
    }
}