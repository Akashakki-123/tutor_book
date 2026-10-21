import { createServer } from "http";
import { config } from "dotenv";
import app from "./app.js";

config();

const server = createServer(app);
const port = process.env.PORT || process.env.APPID || 8000;

try {
  server.listen(port, () => {
    console.log(`Backend running on port ${port}`);
  });

  server.on("error", (err: Error) => {
    console.error(err);
  });
} catch (error) {
  console.error(error);
}
