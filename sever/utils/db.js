import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres:pudit2010@localhost:5432/books-store",
});

export { pool };
export default pool;