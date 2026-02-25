import midtransClient from "midtrans-client";

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

if (!serverKey || !clientKey) {
  throw new Error(
    "Midtrans credentials not configured. Please add MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY to your .env file"
  );
}

// Snap API for creating payment snap token
export const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});

// Core API for advanced operations (check status, cancel, etc.)
export const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey,
  clientKey,
});

export default {
  snap,
  coreApi,
  isProduction,
};
