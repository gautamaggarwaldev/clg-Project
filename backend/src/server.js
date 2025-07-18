import express from 'express';
import "../config/dbConfig.js";
import cookieParser from "cookie-parser";
import routes from "../src/routes/index.js";
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();


const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({extended: true}));

app.use('/v1', routes);

export default app;