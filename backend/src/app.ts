import express from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import messageRoutes from "./routes/message.routes";
import chatRoutes from "./routes/chat.routes";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler } from "./middleware/error-handler";
import path from "node:path";

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies /

// Clerk middleware
// Middleware that integrates Clerk authentication into your Express application. It checks the request's cookies and headers for a session JWT and, if found, attaches the Auth object to the request object under the auth key.
// if not
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "Server is healthy",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chats", chatRoutes);

const shouldServeFrontendFromBackend =
  process.env.SERVE_FRONTEND_FROM_BACKEND === "true" ||
  process.env.NODE_ENV === "production";

if (shouldServeFrontendFromBackend) {
  app.use(express.static(path.join(__dirname, "..", "..", "web", "dist")));
  app.get("/{*any}", (_, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "web", "dist", "index.html"));
  });
} 

// error handling middleware should be the last middleware added to the app, after all routes and other msiddleware have been defined. This ensures that it can catch and handle any errors that occur in the routes or other middleware.
app.use(errorHandler);
export default app;
