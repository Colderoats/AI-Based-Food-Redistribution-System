import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";
let socket;

export const subscribeToAiUpdates = (onUpdate) => {
  const token = localStorage.getItem("token");
  if (!token) return () => {};

  socket ??= io(SOCKET_URL, { auth: { token } });
  socket.on("ai:predictions-updated", onUpdate);
  return () => socket?.off("ai:predictions-updated", onUpdate);
};
