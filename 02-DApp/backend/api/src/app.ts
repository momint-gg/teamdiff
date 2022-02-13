import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response } from "express";

import statsController from './controllers/statsController'

const app = express()

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.json());

app.get("/", (req: Request , res: Response) => {
    res.send("Welcome to the internal API!");
});

app.use("/stats", statsController);

export default app;
