import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

app.use("/api", limiter);

app.get("/api", (_, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`AuthServ API is running on port ${PORT}🚀`);
});
