import express from 'express';
import { createServer as createViteServer } from 'vite';
import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import net from 'net';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;
const BACKEND_PORT = 8081;

let backendProc: ChildProcess | null = null;

// Probe if port is already listening
function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

// Clean process exit handler
function registerProcessCleanup() {
  const cleanup = () => {
    if (backendProc && !backendProc.killed) {
      console.log('[Server] Terminating backend process...');
      try {
        backendProc.kill('SIGTERM');
      } catch (e) {}
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(0); });
  process.on('SIGTERM', () => { cleanup(); process.exit(0); });
}

// Initialize Spring Boot process only if not already active
async function initBackend() {
  const active = await isPortInUse(BACKEND_PORT);
  if (active) {
    console.log(`[Server] Spring Boot backend already listening on port ${BACKEND_PORT}. Reusing existing instance.`);
    return;
  }

  const jarPath = path.resolve(process.cwd(), 'backend/target/ecommerce-backend-1.0.0.jar');
  const useJar = fs.existsSync(jarPath);

  if (useJar) {
    console.log('[Server] Launching compiled Spring Boot JAR executable...');
    backendProc = spawn('java', ['-jar', jarPath], { stdio: 'inherit' });
  } else {
    console.log('[Server] Launching Spring Boot via Maven plugin...');
    backendProc = spawn('mvn', ['spring-boot:run', '-f', 'backend/pom.xml'], { stdio: 'inherit', shell: true });
  }

  backendProc.on('error', (err) => {
    console.error('[Server] Backend launch error:', err);
  });

  registerProcessCleanup();
}

initBackend();

// CORS & Preflight handling for dev/preview iframe
app.use('/api', (req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Proxy /api requests to Spring Boot with retry handling
app.use('/api', (req, res) => {
  const bodyChunks: Buffer[] = [];

  req.on('data', (chunk) => bodyChunks.push(Buffer.from(chunk)));
  req.on('end', () => {
    const requestBody = Buffer.concat(bodyChunks);
    forwardApiRequest(req, res, requestBody, 0);
  });
});

function forwardApiRequest(req: express.Request, res: express.Response, bodyBuffer: Buffer, attempt: number) {
  const maxAttempts = 60;
  const targetUrl = `http://127.0.0.1:${BACKEND_PORT}/api${req.url}`;

  const headers: Record<string, string> = {};
  Object.entries(req.headers).forEach(([k, v]) => {
    const keyLower = k.toLowerCase();
    // Do not pass external host, origin, or referer to avoid Spring Security CORS mismatch on localhost
    if (v && keyLower !== 'host' && keyLower !== 'origin' && keyLower !== 'referer') {
      headers[k] = Array.isArray(v) ? v.join(', ') : v;
    }
  });

  headers['host'] = `127.0.0.1:${BACKEND_PORT}`;
  headers['content-length'] = String(bodyBuffer.length);

  const proxyReq = http.request(targetUrl, {
    method: req.method,
    headers,
  }, (proxyRes) => {
    res.status(proxyRes.statusCode || 200);
    Object.entries(proxyRes.headers).forEach(([key, val]) => {
      // Don't overwrite our unified CORS headers
      if (val && !key.toLowerCase().startsWith('access-control-')) {
        res.setHeader(key, val);
      }
    });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    if (attempt < maxAttempts) {
      setTimeout(() => {
        forwardApiRequest(req, res, bodyBuffer, attempt + 1);
      }, 500);
    } else {
      console.warn(`[Proxy Error] ${req.method} /api${req.url} failed after ${maxAttempts} attempts: ${err.message}`);
      res.status(503).json({
        success: false,
        message: 'Spring Boot backend is initializing. Please try again in a moment.',
        error: err.message,
      });
    }
  });

  if (bodyBuffer.length > 0) {
    proxyReq.write(bodyBuffer);
  }
  proxyReq.end();
}

// Mount Vite middleware for frontend SPA
async function startServer() {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      allowedHosts: true,
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] ApexStore application running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
