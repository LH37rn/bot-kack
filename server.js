const TelegramBot = require('node-telegram-bot-api');
const io = require('socket.io-client');
const fs = require('fs'); // Quitar el prefijo 'node:'

// Leer configuración de data.json
try {
  const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
  const token = data.token;
  const chatId = data.id; // Asumiendo que este es el ID del chat, ajusta si es necesario.
  const host = data.host;
  // ...
} catch (err) {
  console.error("Error leyendo data.json:", err);
  process.exit(1); // Salir con un código de error si no se puede leer data.json
}

const bot = new TelegramBot(token, { polling: true });
const socket = io(host);

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "¡Bienvenido al bot! Esperando conexiones...");
});

socket.on('connect', () => {
  console.log('Conectado al servidor!');
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor!');
});

socket.on('deviceConnected', (data) => {
  const message = `Nuevo dispositivo conectado: ${JSON.stringify(data)}`;
  console.log(message);
  bot.sendMessage(chatId, message); // Usando el ID de chat del archivo JSON
});

socket.on('error', (error) => {
  console.error('Error de socket.io:', error);
});

bot.on('polling_error', (error) => {
  console.error('Error de Telegram Bot:', error);
});

bot.onText(/\/info/, (msg) => {
  bot.sendMessage(msg.chat.id, `Usuario: ${msg.from.first_name} ${msg.from.last_name} \n ID: ${msg.from.id}`);
});
