import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(express.json());

  // Mock Payment Database
  const payments = new Map<string, { id: string, phone: string, status: 'PENDING' | 'SUCCESS' | 'FAILED', amount: number }>();

  // API Routes
  app.post("/api/mbway/pay", (req, res) => {
    const { phone, amount } = req.body;
    if (!phone || phone.length < 9) {
      return res.status(400).json({ error: "Número de telemóvel inválido" });
    }

    const paymentId = Math.random().toString(36).substring(7);
    payments.set(paymentId, { id: paymentId, phone, status: 'PENDING', amount });

    console.log(`[MB WAY] Pagamento iniciado: ${paymentId} para ${phone} (${amount}€)`);

    // Simulate asynchronous approval (in a real app, this would be a webhook from SIBS/IfThenPay)
    setTimeout(() => {
      const payment = payments.get(paymentId);
      if (payment && payment.status === 'PENDING') {
        payment.status = 'SUCCESS';
        io.emit(`payment_status_${paymentId}`, { status: 'SUCCESS' });
        console.log(`[MB WAY] Pagamento aprovado: ${paymentId}`);
      }
    }, 5000);

    res.json({ paymentId });
  });

  app.get("/api/mbway/status/:id", (req, res) => {
    const payment = payments.get(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: "Pagamento não encontrado" });
    }
    res.json(payment);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
