const http = require('http');
const WebSocket = require('ws');

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('colamone_vs relay server\n');
});

const wss = new WebSocket.Server({ server });

let waiting = null;
const peers = new Map(); // ws -> { id, name, opponent }

function send(ws, obj) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(obj));
  }
}

function makeId() {
  return Math.random().toString(36).slice(2);
}

function cleanup(ws) {
  const p = peers.get(ws);
  if (!p) return;

  if (waiting === ws) {
    waiting = null;
  }

  if (p.opponent && peers.has(p.opponent)) {
    const opp = peers.get(p.opponent);
    if (opp) {
      opp.opponent = null;
      send(p.opponent, { type: 'peer-left' });
    }
  }

  peers.delete(ws);
}

wss.on('connection', (ws) => {
  peers.set(ws, { id: makeId(), name: 'Anonymous player', opponent: null });

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch (_) {
      return;
    }

    const me = peers.get(ws);
    if (!me) return;

    if (msg.type === 'join') {
      me.name = msg.name || me.name;

      if (waiting && waiting !== ws && peers.has(waiting)) {
        const opponent = peers.get(waiting);
        me.opponent = waiting;
        opponent.opponent = ws;

        send(ws, { type: 'matched', role: 'red', opponentName: opponent.name });
        send(waiting, { type: 'matched', role: 'blue', opponentName: me.name });

        waiting = null;
      } else {
        waiting = ws;
      }
      return;
    }

    if (msg.type === 'data') {
      if (me.opponent && peers.has(me.opponent)) {
        send(me.opponent, { type: 'data', from: me.id, payload: msg.payload });
      }
    }
  });

  ws.on('close', () => cleanup(ws));
  ws.on('error', () => cleanup(ws));
});

server.listen(port, () => {
  console.log(`colamone_vs relay listening on :${port}`);
});
