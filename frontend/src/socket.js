import { io } from "socket.io-client";

const socket = io("https://peer-room-lite.onrender.com"); // Update if your server is on a different port

export default socket;
