#!/usr/bin/env node
// Local SMTP catcher for development. Accepts every message on EMAIL_SERVER_PORT (default 1025)
// and writes it to .dev-mail/<timestamp>.eml so email flows can be verified without a real
// mail provider. Usage: node scripts/dev/smtp-sink.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import net from "node:net";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const port = Number(process.env.EMAIL_SERVER_PORT || 1025);
const outDir = join(dirname(fileURLToPath(import.meta.url)), "../../.dev-mail");
mkdirSync(outDir, { recursive: true });

let counter = 0;

const server = net.createServer((socket) => {
  let buffer = "";
  let inData = false;
  let envelope = { from: "", to: [] };
  const reply = (line) => socket.write(`${line}\r\n`);
  reply("220 nodslot-dev-smtp ready");

  socket.on("data", (chunk) => {
    buffer += chunk.toString("utf8");
    while (true) {
      if (inData) {
        const end = buffer.indexOf("\r\n.\r\n");
        if (end === -1) return;
        const body = buffer.slice(0, end).replace(/\r\n\.\./g, "\r\n.");
        buffer = buffer.slice(end + 5);
        inData = false;
        counter += 1;
        const file = join(outDir, `${Date.now()}-${counter}.eml`);
        writeFileSync(
          file,
          `X-Envelope-From: ${envelope.from}\r\nX-Envelope-To: ${envelope.to.join(", ")}\r\n${body}`
        );
        console.log(`[smtp-sink] saved ${file} to=${envelope.to.join(",")}`);
        envelope = { from: "", to: [] };
        reply("250 OK: queued");
        continue;
      }
      const lineEnd = buffer.indexOf("\r\n");
      if (lineEnd === -1) return;
      const line = buffer.slice(0, lineEnd);
      buffer = buffer.slice(lineEnd + 2);
      const command = line.slice(0, 4).toUpperCase();
      if (command === "EHLO" || command === "HELO") {
        socket.write("250-nodslot-dev-smtp\r\n250 8BITMIME\r\n");
      } else if (command === "MAIL") {
        envelope.from = line.replace(/^MAIL FROM:\s*/i, "");
        reply("250 OK");
      } else if (command === "RCPT") {
        envelope.to.push(line.replace(/^RCPT TO:\s*/i, ""));
        reply("250 OK");
      } else if (command === "DATA") {
        inData = true;
        reply("354 End data with <CR><LF>.<CR><LF>");
      } else if (command === "QUIT") {
        reply("221 Bye");
        socket.end();
        return;
      } else if (command === "RSET") {
        envelope = { from: "", to: [] };
        reply("250 OK");
      } else {
        reply("250 OK");
      }
    }
  });
  socket.on("error", () => socket.destroy());
});

server.listen(port, "127.0.0.1", () =>
  console.log(`[smtp-sink] listening on 127.0.0.1:${port}, saving to ${outDir}`)
);
