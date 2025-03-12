module.exports = async (sock, m) => {
    if (!sock.public && !ownerNumber.includes(m.sender.split('@')[0])) {
        return
    }
}