// File: server/index.js
// Minimal Express server with Khalti and eSewa verification endpoints
// Now using PostgreSQL with Prisma

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health ---
app.get("/api/health", (_, res) => res.json({ ok: true }));

// --- Khalti: verify token from frontend Checkout payload ---
app.post("/api/payments/khalti/verify", async (req, res) => {
  try {
    const { token, amount, payer } = req.body; // amount in paisa
    if (!token || !amount)
      return res.status(400).json({ error: "token and amount required" });

    const resp = await axios.post(
      "https://khalti.com/api/v2/payment/verify/",
      { token, amount },
      { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
    );

    const amtNpr = Math.round((resp.data.amount || amount) / 100);
    
    // Save to PostgreSQL using Prisma
    await prisma.donation.create({
      data: {
        gateway: "khalti",
        amount: amtNpr,
        payerName: payer?.name,
        payerEmail: payer?.email,
        payerPhone: payer?.phone,
        meta: resp.data,
      },
    });

    return res.json({ ok: true, data: resp.data });
  } catch (err) {
    const data = err.response?.data || { message: err.message };
    return res.status(400).json({ ok: false, error: data });
  }
});

// --- eSewa: classic ePay flow ---
app.get("/api/payments/esewa/success", async (req, res) => {
  try {
    const { amt, refId, oid } = req.query; 
    if (!amt || !refId || !oid) return res.status(400).send("Missing params");

    const form = new URLSearchParams();
    form.append("amt", String(amt));
    form.append("scd", process.env.ESEWA_SCD);
    form.append("rid", refId);
    form.append("pid", oid);

    const url =
      process.env.ESEWA_ENV === "live"
        ? "https://esewa.com.np/epay/transrec"
        : "https://uat.esewa.com.np/epay/transrec";

    const verify = await axios.post(url, form.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const ok = /Success/i.test(verify.data);
    if (ok) {
      // Security: Check if this transaction was already processed
      const existing = await prisma.donation.findFirst({
        where: { meta: { path: ['rid'], equals: refId } }
      });

      if (existing) {
        console.log(`Duplicate eSewa transaction attempt: ${refId}`);
        return res.redirect(process.env.FRONTEND_SUCCESS_URL || "/paid?via=esewa");
      }

      await prisma.donation.create({
        data: {
          gateway: "esewa",
          amount: Number(amt),
          meta: { rid: refId, pid: oid, raw: verify.data },
        },
      });
      
      return res.redirect(
        process.env.FRONTEND_SUCCESS_URL || "/paid?via=esewa"
      );
    } else {
      return res.redirect(
        process.env.FRONTEND_FAILURE_URL || "/pay-failed?via=esewa"
      );
    }
  } catch (err) {
    return res.redirect(
      process.env.FRONTEND_FAILURE_URL || "/pay-failed?via=esewa"
    );
  }
});

app.get("/api/payments/esewa/failure", (req, res) => {
  return res.redirect(
    process.env.FRONTEND_FAILURE_URL || "/pay-failed?via=esewa"
  );
});

async function boot() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected via Prisma");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }

  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Server on :${port}`));
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

boot();
