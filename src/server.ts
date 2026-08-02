import app from "./app";
import "dotenv/config";
import config from "./config";
import { prisma } from "./lib/prisma";

const port = config.port;
async function main() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log("Error starting the server:", error);
    process.exit(1);
  }
}
main();