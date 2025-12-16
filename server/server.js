const express = require("express");
const path = require("path");
const mqtt = require("mqtt");

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "public")));

// MQTT SETUP
const client = mqtt.connect("mqtt://broker.hivemq.com");

client.on("connect", () => {
  console.log("✅ MQTT Connected");

  client.subscribe("agrisensex/sensor/1");
  client.subscribe("agrisensex/motor/1/status");
});

// DATA STORAGE

let sensorData = { voltage: 0, current: 0 };
let motorStatus = "OFF";

// MQTT MESSAGE HANDLER

client.on("message", (topic, message) => {
  const msg = message.toString();

  if (topic === "agrisensex/sensor/1") {
    try {
      sensorData = JSON.parse(msg);
    } catch (err) {
      console.error("❌ Sensor JSON parse error");
    }
  }

  if (topic === "agrisensex/motor/1/status") {
    motorStatus = msg;
  }
});

app.get("/api/sensor", (req, res) => {
  res.json(sensorData);
});

app.get("/api/motor-status", (req, res) => {
  res.json({ status: motorStatus });
});

app.post("/api/motor", (req, res) => {
  const { motor, state } = req.body;

  const topic = `agrisensex/motor/${motor}/cmd`;
  client.publish(topic, state);

  console.log(`➡ Motor ${motor} command: ${state}`);
  res.json({ success: true });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("/home.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "home.html"));
});

app.get("/device.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "device.html"));
});

app.get("/monitor.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "monitor.html"));
});

app.get("/motor1.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "motor1.html"));
});

app.get("/motor2.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "motor2.html"));
});

app.get("/motor3.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "motor3.html"));
});

app.get("/motor4.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "motor4.html"));
});


// START SERVER

app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
