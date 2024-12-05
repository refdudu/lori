const express = require("express");
const path = require("path");
const app = express();
const connectionString =
  "DefaultEndpointsProtocol=https;AccountName=unijui;AccountKey=mlNAAwIwvgacISWE3dvF/Wqe/TDudv6vmg6Rfqf2q5Qq7RscFu4XFbUR0GEJhKREx6FoahWs53Bq+AStVoQ6oQ==;EndpointSuffix=core.windows.net";
const tableName = "mensageria";

const port = 3001;

let data = {
  humidity: 0,
  temperature: 0,
  timestamp: new Date(),
};

let _airConditioning = true;
let _humidifier = false;

const { TableClient } = require("@azure/data-tables");
const tableClient = TableClient.fromConnectionString(
  connectionString,
  tableName
);

async function listTables() {
  const list = [];
  const entities = tableClient.listEntities();
  for await (const entity of entities) {
    list.push(entity);
  }
  return list;
}

app.use(express.json());
app.get("/list", async (req, res) => {
  try {
    const list = await listTables();
    res.status(200).json({ list });
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e.message });
  }
});
app.get("/status", async (req, res) => {
  res.status(200).json(data);
});
const get = (bool) => (bool ? "ligado" : "desligado");
app.post("/", (req, res) => {
  const { humidity, temperature } = req.body;
  data = {
    humidity,
    temperature,
    timestamp: new Date(),
  };
  res.status(200).json(data);
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.listen(port, () => console.log("Servidor rodando"));
