const express = require("express");
const path = require("path");
const crypto = require("crypto");
const localtunnel = require("localtunnel");

const app = express();
const port = 3000;

const key = Buffer.from("1234567890123456", "utf-8"); // Chave de 16 bytes
const iv = Buffer.from("abcdefghijklmnop", "utf-8"); // IV de 16 bytes (usado no Pytho

let data = {
  humidity: 10,
  temperature: 0,
  date: new Date(),
  airConditioning: false,
  humidifier: false,
};

// Função para descriptografar dados
function decryptAES(encryptedData) {
  // Converter os dados de base64 para buffer
  const encryptedBuffer = Buffer.from(encryptedData, "base64");

  // Criar o decifrador AES
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);

  // Descriptografar os dados
  let decrypted = decipher.update(encryptedBuffer, undefined, "utf-8");
  decrypted += decipher.final("utf-8");

  // Remover o padding
  const padLength = decrypted.charCodeAt(decrypted.length - 1);
  decrypted = decrypted.slice(0, -padLength);

  return decrypted;
}

const moment = require("moment");
moment.locale("pt-br");
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.get("/status", async (req, res) => {
  const _date = moment(data.date).add(-3, "h");
  res.status(200).json({
    humidity: data.humidity,
    temperature: data.temperature,
    date: `${_date.format("L")} ${_date.format("LTS")}`,
  });
});
app.post("/status", (req, res) => {
  const { encrypted } = req.body;
  if (!encrypted || encrypted.length === 0) res.status(400);

  const json = decryptAES(encrypted);

  const { humidity, temperature } = JSON.parse(json);
  data = {
    humidity,
    temperature,
    date: new Date(),
    airConditioning: temperature > 25,
    humidifier: humidity < 60,
  };
  res.status(200).json(data);
});
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.listen(port, async () => {
  console.log(`Servidor rodando na porta ${port}`);
  const tunnel = await localtunnel({
    port: port,
    subdomain: "renanfischerunijui",
  });
  console.log(`URL do túnel: ${tunnel.url}`);
  tunnel.on("close", () => {
    console.log("Túnel fechado");
  });
});
