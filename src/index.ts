import express from "express";
import http from "http";
import logger from "morgan";
import path from "path";
import socketIO from "socket.io";
import { configurarRecursos } from "./recursos";
import routes from "./routes";
import socket from "./socket";

const app = express();
const port = process.env.PORT ?? 3000;

app.enable("trust proxy");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");
app.set("port", port);

app.use(
  logger("dev", {
    skip: req => req.url === "/_health",
  }),
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/", routes);

configurarRecursos()
  .then(() => {
    const server = http.createServer(app);
    const io = socketIO.listen(server);

    socket(io);

    server.listen(port, () => {
      console.log("\nListening on", server.address());
    });
  })
  .catch(console.error);
