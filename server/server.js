const express = require("express");
const path = require("path");
const mqtt = require("mqtt");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

/* ================= MQTT SETUP ================= */
const client = mqtt.connect("mqtt://test.mosquitto.org");


client.on("connect", () => {
  console.log("✅ MQTT Connected");

  client.subscribe("agrisensex/sensor/1");
  client.subscribe("agrisensex/motor/1/status");
});

/* ================= DATA STORAGE ================= */
let sensorData = {
  R: { voltage: 0, current: 0 },
  Y: { voltage: 0, current: 0 },
  B: { voltage: 0, current: 0 }
};

let motors = {
  1: "OFF"
};

let thresholds = {
  voltage: 230,
  current: 1
};

/* ================= MQTT MESSAGE HANDLER ================= */
client.on("message", (topic, message) => {
  const msg = message.toString();

  if (topic === "agrisensex/sensor/1") {
    try {
      const d = JSON.parse(msg);
      sensorData = d;
    } catch (e) {
      console.log("Invalid sensor JSON");
    }
  }

  if (topic === "agrisensex/motor/1/status") {
    motors[1] = msg;
  }
});

/* ================= API ROUTES ================= */

// Sensor data
app.get("/api/sensor", (req, res) => {
  res.json(sensorData);
});

// Motor status
app.get("/api/motor-status/:id", (req, res) => {
  res.json({ status: motors[req.params.id] || "OFF" });
});

// Motor control
app.post("/api/motor", (req, res) => {
  const { motor, state } = req.body;

  client.publish(
  `agrisensex/motor/${motor}/control`,
  state
);


  res.json({ success: true });
});

// Threshold update
app.post("/api/threshold", (req, res) => {
  thresholds = req.body;

  client.publish(
    "agrisensex/settings/1",
    JSON.stringify(thresholds),
    { retain: true }
  );

  res.json({ success: true });
});

/* ================= PAGES ================= */
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "..", "public", "index.html"))
);

app.get("/home.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "home.html"));
});

app.get("/device.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "device.html"));
});

app.get("/monitor.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "monitor.html"));
});
app.get("/motor1.html", (req, res) =>
  res.sendFile(path.join(__dirname, "..", "public", "motor1.html"))
);
app.get("/motor2.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "motor2.html"));
});

app.get("/motor3.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "motor3.html"));
});

app.get("/motor4.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "motor4.html"));
});
/* ================= START SERVER ================= */
app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
