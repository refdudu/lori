const express = require("express");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
const port = 3000;

let data = {
  humidity: 10,
  temperature: 0,
  date: new Date(),
  airConditioning: false,
  humidifier: false,
  encryptedText: "",
};

const key = Buffer.from("unijuiunijuiunij", "utf-8"); // Chave de 16 bytes
const iv = Buffer.from("abcdefghijklmnop", "utf-8"); // IV de 16 bytes (usado no Pytho

const moment = require("moment");
moment.locale("pt-br");
app.use(express.json());

// Função para descriptografar dados
function decryptAES(encryptedData) {
  // Converter os dados de base64 para buffer
  const encryptedBuffer = Buffer.from(encryptedData, "base64");
  // Criar o decifrador AES
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  // Descriptografar os dados
  let decrypted = decipher.update(encryptedBuffer, undefined, "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

// app.use(express.urlencoded({ extended: true }));

app.get("/status", async (req, res) => {
  const list = getDatabase();
  const {
    airConditioning,
    date,
    encryptedText,
    humidifier,
    humidity,
    temperature,
  } = data;
  const _date = moment(date).add(-3, "h");
  res.status(200).json({
    airConditioning,
    encryptedText,
    humidifier,
    humidity,
    temperature,
    date: `${_date.format("L")} ${_date.format("LTS")}`,
    list,
  });
});

app.post("/status", (req, res) => {
  try {
    const { encrypted } = req.body;
    if (!encrypted || encrypted.length === 0) res.status(400);
    const json = decryptAES(encrypted);
    const { humidity, temperature } = JSON.parse(json);
    const _data = { humidity, temperature, date: new Date() };
    const list = addDatabase(_data);

    data = {
      humidity,
      temperature,
      date: new Date(),
      encryptedText: encrypted,
      airConditioning: temperature > 25,
      humidifier: humidity < 60,
      list,
    };
    res.status(200).json(data);
  } catch {
    res.status(404);
  }
});

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => `Servidor rodando na porta ${port}`);

const databaseJson = fs.readFileSync(
  path.join(__dirname, "database.json"),
  "utf-8"
);
function getDatabase() {
  return JSON.parse(databaseJson);
}
function addDatabase(data) {
  const database = getDatabase();
  database = [...database,data]
  fs.writeFileSync(
    path.join(__dirname, "database.json"),
    JSON.stringify(database)
  );
  return database;
}
