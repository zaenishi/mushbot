require("../config.js");
const { getContentType } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

// === Inisialisasi Cache Plugin ===
const pluginDir = path.join(__dirname, "./handlers");
const plugins = new Map();

const loadPlugins = () => {
  try {
    const pluginFiles = fs
      .readdirSync(pluginDir)
      .filter((file) => file.endsWith(".js"));

    for (const file of pluginFiles) {
      try {
        const plugin = require(path.join(pluginDir, file));

        if (typeof plugin === "function") {
          plugins.set(file, plugin);
          console.log(chalk.blue(`[PLUGIN] "${file}" dimuat`));
        } else if (plugin.command) {
          plugins.set(plugin.command, plugin);
          console.log(chalk.blue(`[PLUGIN] "${plugin.command}" dimuat dari ${file}`));
        }
      } catch (err) {
        console.error(chalk.red(`[ERROR] Gagal memuat plugin ${file}: ${err.message}`));
      }
    }
  } catch (err) {
    console.error(chalk.red(`[ERROR] Membaca direktori plugins gagal: ${err.message}`));
  }
};

loadPlugins();

// === Global Db ===
if (!global.db) global.db = {};
if (!global.db.data)
  global.db.data = {
    users: {},
    chats: {},
    settings: {},
  };
if (!global.db.data.users) global.db.data.users = {};
if (!global.db.data.chats) global.db.data.chats = {};

// === Command Handler Module ===
module.exports = async (sock, m, store) => {
  try {
    if (!m.message) return;

    const text =
      m.message.conversation || m.message.extendedTextMessage?.text || "";

    let command, prefix;
    if (prefixes.some((p) => text.startsWith(p))) {
      prefix = prefixes.find((p) => text.startsWith(p));
      command = text.slice(prefix.length).trim().split(/ +/)[0].toLowerCase();
    } else {
      command = text.trim().split(/ +/)[0].toLowerCase();
    }

    const args = text.trim().split(/ +/).slice(1);

    const isGroup = m.key.remoteJid.endsWith("@g.us");
    const sender = m.key.participant || m.key.remoteJid;
    const senderId = sender.split("@")[0];
    const isOwner = ownerNumber.includes(senderId);

    let isAdmin = false;
    if (isGroup) {
      try {
        const metadata = await sock.groupMetadata(m.key.remoteJid);
        isAdmin = metadata.participants.some((p) => p.admin && p.id === sender);
      } catch (err) {
        console.error(chalk.red(`[ERROR] Gagal mengambil metadata grup: ${err.message}`));
      }
    }

    if (command && !isGroup) {
      console.log(
        chalk.green(`[${new Date().toISOString()}] [${isGroup ? "Group" : "Private"}] ${senderId}: ${text}`)
      );
    }

    m.args = args;
    m.text = text;
    m.sender = sender;
    m.isGroup = isGroup;
    m.type = getContentType(m.message);
    m.msg =
      m.type === "viewOnceMessage"
        ? m.message[m.type].message[getContentType(m.message[m.type].message)]
        : m.message[m.type];
    m.quoted = m.msg?.contextInfo?.quotedMessage || null;
    m.mentionedJid = m.msg?.contextInfo?.mentionedJid || [];
    m.reply = (text) => {
      return sock.sendMessage(m.key.remoteJid, { text }, { quoted: m });
    };

    for (const plugin of plugins.values()) {
      if (typeof plugin === "function") {
        try {
          await plugin(sock, m, store);
        } catch (execErr) {
          console.error(chalk.red(`[ERROR] Plugin otomatis gagal: ${execErr.message}`));
        }
      }
    }

    if (!command) return;

    const plugin = plugins.get(command);
    if (!plugin) return;
    if (!prefix && !plugin.noprefix) return;
    if (plugin.ownerOnly && !isOwner) return m.reply("❌ Hanya Owner!");
    if (plugin.adminOnly && !isAdmin) return m.reply("🛡️ Hanya Admin!");
    if (plugin.groupOnly && !isGroup) return m.reply("👥 Hanya di Grup!");
    if (plugin.privateOnly && isGroup) return m.reply("📩 Hanya di Private!");
    if (plugin.premiumOnly && (!store.premium || !store.premium.includes(sender)))
      return m.reply("💎 Hanya Premium!");

    console.log(chalk.blue(`[${new Date().toISOString()}] Eksekusi command "${command}" dari ${senderId}`));

    await plugin.execute(sock, m, store);
    console.log(chalk.green(`[${new Date().toISOString()}] Command "${command}" berhasil dieksekusi.`));
  } catch (err) {
    console.error(chalk.red(`[ERROR] Exception pada command handler: ${err.message}`));
    m.reply("Terjadi kesalahan saat mengeksekusi perintah.");
  }
};