import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Update if your server is on a different port

export default socket;
