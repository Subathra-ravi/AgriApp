const express = require("express");
const path = require("path");
const mqtt = require("mqtt");

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "public")));

// MQTT SETUP
const client = mqtt.connect("wss://test.mosquitto.org:8081/mqtt");

client.on("connect", () => {
  console.log("✅ MQTT Connected");

  client.subscribe("agrisensex/sensor/1");
  client.subscribe("agrisensex/motor/1/status");
});

// DATA STORAGE

let sensorData = { voltage: 0, current: 0 };
let motorStatus = "OFF";
let sensorData = {
  R: { voltage: 231.1, current: 0.04 },
  Y: { voltage: 231.4, current: 0.04 },
  B: { voltage: 96.9,  current: 0.00 }
};
client.on("connect", () => {
  client.subscribe("agrisensex/sensor/1");
});


// MQTT MESSAGE HANDLER
client.on("message", (topic, message) => {
  const msg = JSON.parse(message.toString());

  if (topic === "agrisensex/sensor/1") {
    sensorData = {
      R: { voltage: msg.R.voltage, current: msg.R.current },
      Y: { voltage: msg.Y.voltage, current: msg.Y.current },
      B: { voltage: msg.B.voltage, current: msg.B.current }
    };
  }
});


app.get("/api/sensor", (req, res) => {
  res.json(sensorData);
});

app.get("/api/motor-status/:id", (req, res) => {
  const id = req.params.id;

  res.json({
    status: motors[id] || "OFF"
  });
});

let motors = {
  1: "OFF"
};

app.post("/api/motor", (req, res) => {
  const { motor, state } = req.body;

  motors[motor] = state;   // ✅ UPDATE STATUS

  console.log(`Motor ${motor} turned ${state}`);

  res.json({ success: true });
});


app.get("/api/sensor", (req, res) => {
  res.json(sensorData);
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
