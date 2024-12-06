const express = require("express");
const path = require("path");
const app = express();
const connectionString =
  "DefaultEndpointsProtocol=https;AccountName=unijui;AccountKey=mlNAAwIwvgacISWE3dvF/Wqe/TDudv6vmg6Rfqf2q5Qq7RscFu4XFbUR0GEJhKREx6FoahWs53Bq+AStVoQ6oQ==;EndpointSuffix=core.windows.net";
const tableName = "mensageria";

const port = 3000;

let data = {
  humidity: 0,
  temperature: 0,
  date: new Date(),
};

const { TableClient } = require("@azure/data-tables");
const moment = require("moment");
moment.locale("pt-br");

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
  list.sort((a, b) => (new Date(b.timestamp) > new Date(a.timestamp) ? -1 : 1));
  const _list = list.map((x) => ({
    ...x,
    date: moment(x.timestamp).add(-3, "h").format("HH:mm:ss"),
  }));
  return _list;
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
  const _date = moment(data.date).add(-3, "h");
  res.status(200).json({
    ...data,
    date: `${_date.format("L")} ${_date.format("LTS")}`,
  });
});
app.post("/", (req, res) => {
  const { humidity, temperature } = req.body;
  data = {
    humidity,
    temperature,
    date: new Date(),
  };
  res.status(200).json(data);
});
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.listen(port, () => console.log("Servidor rodando"));
