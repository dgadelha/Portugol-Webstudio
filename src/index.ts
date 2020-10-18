#!/usr/bin/env node

/**
 * Module dependencies.
 */
import http from "http";
import socketIO from "socket.io";
import app from "./app";
import recursos from "./recursos";
import socket from "./socket";

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT ?? 3000;

app.set("port", port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);
const io = socketIO.listen(server);

socket(io);

/**
 * Listen on provided port, on all network interfaces.
 */
recursos(() => {
  server.listen(port, () => {
    console.log("\nListening on", server.address());
  });
});

module.exports = server;
