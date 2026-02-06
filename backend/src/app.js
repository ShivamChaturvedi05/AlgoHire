import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json({limit: "16kb"}));

app.use(express.urlencoded({extended: true, limit: "16kb"}));

app.use(express.static("public"));

app.use(cookieParser());

//Routes:
import userRouter from './routes/user.routes.js';
import roomRouter from './routes/room.routes.js';
import compilerRouter from './routes/compiler.routes.js';


//http://localhost:8000/api/v1/users/
app.use("/api/v1/users", userRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/compiler", compilerRouter);

export { app };