import {Pool} from "pg";

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:pudit2010@localhost:5432/books-store",
});

export default connectionPool;