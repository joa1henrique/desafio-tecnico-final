import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler } from "./middlewares/error-handler";
import { notFound } from "./middlewares/not-found";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(routes);

app.use(notFound);
app.use(errorHandler);

export default app;
