import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL); // Update if your server is on a different port

export default socket;
