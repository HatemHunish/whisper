import app from "./src/app";
import connectDatabase from "./src/config/database";
const PORT = process.env.PORT || 3000;
import { createServer } from 'node:http';
import { initializeSocketServer } from "./src/utils/socket";

const httpServer = createServer(app);

connectDatabase().then(() => {
  initializeSocketServer(httpServer);
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to connect to the database:', error);
  process.exit(1);
});