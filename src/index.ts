import { app } from "./app";
import { connectDB } from "./utils";

const port = process.env.PORT || 3000;
const db_url = process.env.DB_LOCAL_URI!;

const start = async () => {
  await connectDB(db_url);
  app.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}/`);
  });
};

start();
