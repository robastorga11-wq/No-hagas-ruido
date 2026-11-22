const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static("public"));

const players = new Map();
const monster = { x: 0, z: -9, targetX: 0, targetZ: -9, alert: 0, mode: "idle" };
const LIMIT = 3;

io.on("connection", socket => {
  if (players.size >= LIMIT) {
    socket.emit("full");
    socket.disconnect(true);
    return;
  }
  const spawn = [
    {x:-3,z:5}, {x:0,z:6}, {x:3,z:5}
  ][players.size];
  players.set(socket.id, {
    id: socket.id, x: spawn.x, z: spawn.z, rot: 0,
    color: ["#43c6db","#e6b94d","#d879c8"][players.size],
    name: `Jugador ${players.size+1}`, alive: true
  });
  socket.emit("welcome", {id: socket.id, players: [...players.values()], monster});
  io.emit("state", {players:[...players.values()], monster});

  socket.on("move", data => {
    const p = players.get(socket.id);
    if (!p || !p.alive) return;
    const x = Number(data.x), z = Number(data.z), rot = Number(data.rot);
    if (!Number.isFinite(x) || !Number.isFinite(z) || !Number.isFinite(rot)) return;
    p.x = Math.max(-13, Math.min(13, x));
    p.z = Math.max(-13, Math.min(13, z));
    p.rot = rot;
    if (data.noise) makeNoise(p.x, p.z, data.noise === "run" ? 8 : 3);
  });

  socket.on("noise", data => {
    const p = players.get(socket.id);
    if (p && p.alive) makeNoise(p.x, p.z, Math.max(1, Math.min(12, Number(data.power)||4)));
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    io.emit("state", {players:[...players.values()], monster});
  });
});

function makeNoise(x,z,power) {
  monster.targetX = x; monster.targetZ = z;
  monster.alert = Math.max(monster.alert, power * 2.4);
  monster.mode = "hunting";
  io.emit("soundPing", {x,z,power});
}

// La lógica del monstruo vive en el servidor: todos ven el mismo monstruo.
setInterval(() => {
  if (monster.alert > 0) {
    const dx = monster.targetX-monster.x, dz = monster.targetZ-monster.z;
    const d = Math.hypot(dx,dz) || 1;
    const speed = monster.alert > 8 ? 0.105 : 0.065;
    monster.x += dx/d*speed; monster.z += dz/d*speed;
    monster.alert -= 0.035;
    if (d < 0.8) {
      const victim = [...players.values()].find(p => p.alive && Math.hypot(p.x-monster.x,p.z-monster.z)<1.15);
      if (victim) {
        victim.alive = false;
        io.emit("caught", {id:victim.id});
      }
    }
    if (monster.alert <= 0) monster.mode = "searching";
  } else if (monster.mode === "searching") {
    monster.mode = "idle";
  }
  io.emit("state", {players:[...players.values()], monster});
}, 50);

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`NO HAGAS RUIDO en http://localhost:${port}`));