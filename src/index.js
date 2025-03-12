/**
 * Script ini diperbarui dan dioptimalkan oleh Zaenishi.
 * Jika terjadi error atau butuh bantuan, hubungi:
 * Whatsapp: 6283188229366
 * Instagram: @zaenishi
 * Email: @zaenishi
 *
 * Ikuti Sosial Media:
 * Instagram: @zaenishi
 * Tiktok: @zaenishi
 * Twitter: @zaenishi
 * Saluran: https://whatsapp.com/channel/0029Va9scP6CxoAqmRtHG73T
 *
 */

const fs = require("fs");
const path = require("path");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  makeInMemoryStore,
  jidNormalizedUser,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const P = require("pino");
const readline = require("readline");
const NodeCache = require("node-cache");
const chalk = require("chalk");
const figlet = require("figlet");
const boxen = require("boxen");
const ora = require("ora").default;
const { saveDB, loadDB } = require("../database/index.js");

// === Console ===
let consoleStart = false;

// === Global Error Handling ===
process.on("uncaughtException", (error) => {
  console.error(chalk.red("Uncaught Exception:"), error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(chalk.red("Unhandled Rejection:"), reason);
});

// === Tampilan Banner ===
function displayBanner() {
  console.clear();
  const banner = figlet.textSync("MushBot", { horizontalLayout: "full" });
  console.log(
    chalk.cyan(
      boxen(banner, {
        padding: 1,
        margin: 1,
        borderStyle: "double",
        borderColor: "green",
      }),
    ),
  );
  console.log(chalk.bold.yellow("🚀 Script by Zaenishi"));
  console.log(chalk.green("✨ Memulai Script...\n"));
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    }),
  );
}

// === In-Memory Store untuk data ===
const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });
const store = makeInMemoryStore({
  logger: P().child({ level: "silent", stream: "store" }),
});
const STORE_PATH = path.join(__dirname, "db", "store.json");

if (!fs.existsSync(path.join(__dirname, "db"))) {
  fs.mkdirSync(path.join(__dirname, "db"));
}

store.readFromFile(STORE_PATH);
setInterval(() => {
  store.writeToFile(STORE_PATH);
}, 10_000);
setInterval(saveDB, 30000);
loadDB();

// === Exponential Backoff untuk Reconnect ===
let reconnectAttempts = 0;
function resetReconnect() {
  reconnectAttempts = 0;
}
function getReconnectDelay() {
  return Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
}

// === Graceful Shutdown ===
function gracefulShutdown() {
  console.log(chalk.yellow("\nMenutup koneksi dan menyimpan data..."));
  saveDB();
  store
    .writeToFile(STORE_PATH)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(chalk.red("Error saat menyimpan store:"), err);
      process.exit(1);
    });
}
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// === Modularisasi Handler Event ===
async function handleMessages(sock, event) {
  for (const m of event.messages) {
    try {
      await require("./bot.js")(sock, m, store);
    } catch (err) {
      console.error(chalk.red("Error pada handler pesan:"), err);
    }
  }
}

async function updateGroupMetadata(sock, event) {
  try {
    const metadata = await sock.groupMetadata(event.id);
    groupCache.set(event.id, metadata);
  } catch (err) {
    console.error(chalk.red("Error pada groups.update:"), err);
  }
}

// === Auto Clear Sesi ===
function clearSession() {
  const sessionDir = `./auth`;
  const clearInterval = 1 * 60 * 60 * 1000;

  const clearSessionFiles = () => {
    try {
      if (!fs.existsSync(sessionDir)) {
        console.log(chalk.blue.bold("📂 [AUTO CLEAN SESSION]"));
        return;
      }

      const files = fs.readdirSync(sessionDir);
      if (files.length === 0) {
        return;
      }

      const filesToDelete = files.filter(
        (file) =>
          file.startsWith("pre-key") ||
          file.startsWith("sender-key") ||
          file.startsWith("session-") ||
          file.startsWith("app-state"),
      );

      if (filesToDelete.length === 0) {
        return;
      }

      console.log(
        chalk.yellow.bold(
          `📂 [AUTO CLEAN] Found ${filesToDelete.length} session files to clean... 🗃️`,
        ),
      );

      filesToDelete.forEach((file) => {
        const filePath = path.join(sessionDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(chalk.green.bold(`🗑️ Deleted: ${file}`));
        } catch (error) {
          console.error(
            chalk.red.bold(`❌ Failed to delete ${file}: ${error.message}`),
          );
        }
      });

      console.log(
        chalk.green.bold(
          `🗃️ [AUTO CLEAN] Successfully removed ${filesToDelete.length} session files! 📂`,
        ),
      );
    } catch (error) {
      console.error(
        chalk.red.bold("📑 [AUTO CLEAN ERROR]"),
        chalk.red.bold(error.message),
      );
    }
  };

  setInterval(clearSessionFiles, clearInterval);
  clearSessionFiles();
}
clearSession();

// === Koneksi ke WhatsApp ===
async function connectToWhatsApp() {
  displayBanner();
  consoleStart = false;

  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(
    chalk.blue(`Menggunakan versi Baileys: ${version}, Terbaru: ${isLatest}`),
  );

  const sock = makeWASocket({
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 30000,
    emitOwnEvents: false,
    fireInitQueries: false,
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    version,
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["Ubuntu", "Firefox", "120.0"],
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
    getMessage: async (key) => {
      const jid = jidNormalizedUser(key.remoteJid);
      const msg = await store.loadMessage(jid, key.id);
      return msg?.message || "";
    },
  });

  sock.ev.on("creds.update", saveCreds);

  if (!state.creds.registered) {
    let phoneNumber = "";
    if (!phoneNumber) {
      phoneNumber = await askQuestion(
        chalk.blue(
          "Masukkan nomor telepon Anda (format internasional, contoh 6281234567890): ",
        ),
      );
    }
    if (!/^\d+$/.test(phoneNumber)) {
      console.log(
        chalk.red(
          "Nomor telepon tidak valid. Pastikan hanya mengandung angka.",
        ),
      );
      process.exit(1);
    }
    const pairingSpinner = ora(chalk.blue("Mengirim kode pairing...")).start();
    try {
      const code = await sock.requestPairingCode(phoneNumber);
      pairingSpinner.succeed(chalk.green(`Kode Pairing: ${code}`));
    } catch (error) {
      pairingSpinner.fail(chalk.red("Gagal mengirim kode pairing."));
      console.error(error);
      process.exit(1);
    }
  }

  const connectionSpinner = ora(
    chalk.blue("Menghubungkan ke WhatsApp..."),
  ).start();

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      connectionSpinner.fail(chalk.red("Koneksi terputus."));
      const statusCode =
        lastDisconnect?.error instanceof Boom
          ? lastDisconnect.error.output.statusCode
          : undefined;
      if (statusCode === DisconnectReason.badSession) {
        if (fs.existsSync("./auth")) {
          fs.rmSync("./auth", { recursive: true, force: true });
          console.log(
            chalk.green.bold(
              "⚙️ Sesi tidak valid. Script akan restart dalam 5 detik...",
            ),
          );
        }
        return setTimeout(() => connectToWhatsApp(), 5000);
      }
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        reconnectAttempts++;
        const delay = getReconnectDelay();
        console.log(
          chalk.yellow(`Mencoba reconnect dalam ${delay / 1000} detik...`),
        );
        return setTimeout(connectToWhatsApp, delay);
      }
    } else if (connection === "open") {
      resetReconnect();
      connectionSpinner.succeed(chalk.green("Koneksi WhatsApp berhasil!"));
      console.log(`\n`);
      consoleStart = true;
    }
  });

  sock.public = true;

  sock.ev.on("messages.upsert", async (event) => {
    if (!consoleStart) {
      return;
    }

    await handleMessages(sock, event);
  });

  sock.ev.on("groups.update", async ([event]) => {
    await updateGroupMetadata(sock, event);
  });

  sock.ev.on("group-participants.update", async (event) => {
    await updateGroupMetadata(sock, event);
  });
}

connectToWhatsApp();