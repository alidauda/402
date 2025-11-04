import express, { type Response, Request, NextFunction } from "express";
import { createX402 } from "g402-seller-sdk/guard";

const app = express();
const x402 = createX402({
  jwksUrl: process.env.X402_JWKS_URL!,
  issuer: process.env.X402_EXPECTED_ISS,
  audience: process.env.X402_EXPECTED_AUD,
});

// Middleware function
async function paymentGuard(req: Request, res: Response, next: NextFunction) {
  const result = await x402.requirePayment({
    headers: req.headers,
    cookies: req.cookies,
  });

  if (!result.ok) {
    return res.status(result.status).json(result.body);
  }

  // Forward headers to the route handler
  for (const [key, value] of Object.entries(result.headers)) {
    req.headers[key] = value;
  }

  next();
}

// Protect routes
app.get("/api/premium/data", paymentGuard, (req, res) => {
  res.json({ data: "premium content" });
});
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json("hello");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
