/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { connectRedis } from "./app/config/redis.config";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

const startServer = async () => {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(envVars.DB_URL);
    console.log("Connected to DB!!");
    await seedSuperAdmin();

    // Only listen on port locally, not on Vercel
    if (process.env.NODE_ENV !== "production") {
      server = app.listen(envVars.PORT, () => {
        console.log(`Server is listening to port ${envVars.PORT}`);
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// Redis failure should NOT block server start
connectRedis().catch((err) => console.log("Redis connection failed:", err));
startServer();

process.on("SIGTERM", () => {
  console.log("SIGTERM signal recieved... Server shutting down..");
  if (server) server.close(() => process.exit(1));
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal recieved... Server shutting down..");
  if (server) server.close(() => process.exit(1));
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection detected... Server shutting down..", err);
  if (server) server.close(() => process.exit(1));
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception detected... Server shutting down..", err);
  if (server) server.close(() => process.exit(1));
  process.exit(1);
});

export default app;
