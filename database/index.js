require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const dbType = process.env.DB_TYPE || 'json';
const dbFile = path.join(__dirname, 'database.json');
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const mongoDBName = process.env.MONGO_DB_NAME || 'database';
const sqliteFile = process.env.SQLITE_FILE || 'database.sqlite';

let mongoClient, mongoDB, mongoCollection;
let sqliteDB;

let sqlite3;
if (dbType === 'sqlite') {
    try {
        sqlite3 = require('sqlite3').verbose();
    } catch (err) {
        console.error('⚠️ SQLite3 tidak terinstal. Gunakan DB_TYPE lain.');
    }
}

function saveDB() {
    if (dbType === 'json') {
        fs.writeFileSync(dbFile, JSON.stringify(global.db, null, 2));
    } else if (dbType === 'mongodb') {
        saveToMongo();
    } else if (dbType === 'sqlite') {
        saveToSQLite();
    }
}

function loadDB() {
    if (dbType === 'json') {
        try {
            global.db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
        } catch (e) {
            global.db = { data: { users: {}, chats: {} } };
        }
    } else if (dbType === 'mongodb') {
        loadFromMongo();
    } else if (dbType === 'sqlite') {
        loadFromSQLite();
    }
}

async function connectMongo() {
    if (dbType === 'mongodb') {
        mongoClient = new MongoClient(mongoURL);
        await mongoClient.connect();
        mongoDB = mongoClient.db(mongoDBName);
        mongoCollection = mongoDB.collection('database');
        console.log('✅ MongoDB connected!');
    }
}

async function saveToMongo() {
    if (!mongoCollection) return;
    await mongoCollection.updateOne(
        { _id: 'globalDB' },
        { $set: global.db },
        { upsert: true }
    );
}

async function loadFromMongo() {
    if (!mongoCollection) return;
    const data = await mongoCollection.findOne({ _id: 'globalDB' });
    global.db = data || { data: { users: {}, chats: {} } };
}

function connectSQLite() {
    if (dbType === 'sqlite' && sqlite3) {
        sqliteDB = new sqlite3.Database(sqliteFile, (err) => {
            if (err) {
                console.error('❌ SQLite Connection Error:', err.message);
            } else {
                console.log('✅ SQLite connected!');
                initSQLite();
            }
        });
    }
}

function initSQLite() {
    if (!sqliteDB) return;
    sqliteDB.run(
        `CREATE TABLE IF NOT EXISTS database (
            id TEXT PRIMARY KEY,
            data TEXT
        )`,
        (err) => {
            if (err) console.error('❌ Error creating table:', err.message);
        }
    );
}

function saveToSQLite() {
    if (!sqliteDB) return;
    const dataString = JSON.stringify(global.db);
    sqliteDB.run(
        `INSERT INTO database (id, data) VALUES (?, ?)
         ON CONFLICT(id) DO UPDATE SET data=?`,
        ['globalDB', dataString, dataString],
        (err) => {
            if (err) console.error('❌ Error saving to SQLite:', err.message);
        }
    );
}

function loadFromSQLite() {
    if (!sqliteDB) return;
    sqliteDB.get(`SELECT data FROM database WHERE id = ?`, ['globalDB'], (err, row) => {
        if (err) {
            console.error('❌ Error loading from SQLite:', err.message);
            global.db = { data: { users: {}, chats: {} } };
        } else {
            global.db = row ? JSON.parse(row.data) : { data: { users: {}, chats: {} } };
        }
    });
}

if (dbType === 'mongodb') {
    connectMongo();
} else if (dbType === 'sqlite') {
    connectSQLite();
}

module.exports = { saveDB, loadDB };