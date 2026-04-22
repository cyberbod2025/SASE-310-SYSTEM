import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const command = args[0] || "list-tools";
const method = args[1] || "";
const rawParams = args[2] || process.env.TESTSPRITE_TOOL_PARAMS || "{}";

const child = spawn("bash", [".opencode/bin/testsprite-mcp.sh"], {
  cwd: process.cwd(),
  stdio: ["pipe", "pipe", "pipe"],
  env: process.env,
});

let buffer = "";
let nextId = 1;
const pending = new Map();

function send(message) {
  child.stdin.write(`${JSON.stringify(message)}\n`);
}

function request(methodName, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    send({ jsonrpc: "2.0", id, method: methodName, params });
  });
}

function handleMessage(message) {
  if (message.id && pending.has(message.id)) {
    const entry = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) entry.reject(new Error(JSON.stringify(message.error)));
    else entry.resolve(message.result);
  }
}

child.stdout.on("data", (chunk) => {
  buffer += chunk.toString("utf8");

  while (true) {
    const newlineIndex = buffer.indexOf("\n");
    if (newlineIndex === -1) break;
    const line = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);
    if (!line) continue;
    handleMessage(JSON.parse(line));
  }
});

child.stderr.on("data", (chunk) => {
  process.stderr.write(chunk.toString());
});

child.on("exit", (code, signal) => {
  if (pending.size > 0) {
    for (const [, entry] of pending) {
      entry.reject(new Error(`TestSprite MCP exited early (${code ?? signal})`));
    }
    pending.clear();
  }
});

async function main() {
  const init = await request("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "shell-mcp-client", version: "0.1.0" },
  });

  send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });

  if (command === "list-tools") {
    const result = await request("tools/list", {});
    console.log(JSON.stringify({ server: init.serverInfo, tools: result.tools }, null, 2));
    return;
  }

  if (command === "call-tool") {
    const params = JSON.parse(rawParams);
    const result = await request("tools/call", {
      name: method,
      arguments: params,
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main()
  .catch((error) => {
    console.error(error.stack || String(error));
    process.exitCode = 1;
  })
  .finally(() => {
    child.kill("SIGTERM");
    setTimeout(() => process.exit(process.exitCode ?? 0), 150);
  });
