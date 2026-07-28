import dgram from "node:dgram";
import { NextResponse } from "next/server";
import { servers } from "../../../data/servers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const A2S_HEADER = Buffer.from([0xff, 0xff, 0xff, 0xff, 0x54]);
const A2S_PAYLOAD = Buffer.from("Source Engine Query\0", "ascii");
const A2S_REQUEST = Buffer.concat([A2S_HEADER, A2S_PAYLOAD]);

function readCString(buffer, offset) {
  const ending = buffer.indexOf(0, offset);
  if (ending < 0) throw new Error("Invalid A2S response");
  return {
    value: buffer.toString("utf8", offset, ending),
    next: ending + 1
  };
}

function parseInfoResponse(message) {
  if (message.length < 10 || message.readUInt32LE(0) !== 0xffffffff || message[4] !== 0x49) {
    throw new Error("Unexpected A2S response");
  }

  let offset = 6;
  const name = readCString(message, offset);
  offset = name.next;
  const map = readCString(message, offset);
  offset = map.next;
  const folder = readCString(message, offset);
  offset = folder.next;
  const game = readCString(message, offset);
  offset = game.next + 2;

  return {
    name: name.value,
    map: map.value,
    players: message[offset],
    maxPlayers: message[offset + 1],
    bots: message[offset + 2]
  };
}

function queryA2S(server) {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket("udp4");
    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error("A2S query timed out"));
    }, 2500);

    const finish = (callback, value) => {
      clearTimeout(timeout);
      socket.close();
      callback(value);
    };

    socket.on("error", (error) => finish(reject, error));
    socket.on("message", (message) => {
      const responseType = message[4];

      if (responseType === 0x41 && message.length >= 9) {
        socket.send(
          Buffer.concat([A2S_REQUEST, message.subarray(5, 9)]),
          server.queryPort,
          server.ip
        );
        return;
      }

      try {
        finish(resolve, parseInfoResponse(message));
      } catch (error) {
        finish(reject, error);
      }
    });

    socket.send(A2S_REQUEST, server.queryPort, server.ip);
  });
}

export async function GET() {
  const results = await Promise.all(
    servers.map(async (server) => {
      try {
        const status = await queryA2S(server);
        return {
          id: server.id,
          status: "online",
          players: status.players,
          maxPlayers: status.maxPlayers,
          map: status.map || server.map,
          mapUrl: server.mapUrl,
          serverName: status.name,
          checkedAt: new Date().toISOString()
        };
      } catch (error) {
        console.error(`[server-status] ${server.id}:`, error);
        return {
          id: server.id,
          status: "offline",
          players: null,
          maxPlayers: null,
          map: server.map,
          mapUrl: server.mapUrl,
          checkedAt: new Date().toISOString()
        };
      }
    })
  );

  return NextResponse.json(
    { source: "steam-a2s", servers: results },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
  );
}
