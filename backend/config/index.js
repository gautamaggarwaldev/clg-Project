import dotenv from "dotenv";

dotenv.config();

const config = {
    PORT: process.env.PORT||4000,
    DB_URL: process.env.MONGODB_URL,
}

export default config;