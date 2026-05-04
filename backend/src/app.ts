import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/error-handler";
import { notFound } from "./middlewares/not-found";
import { env } from "./config/env";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));

app.use(routes);

app.use(notFound);
app.use(errorHandler);

export default app;
