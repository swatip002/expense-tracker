import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

export const useSocket = () => {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (token) {
      socketRef.current = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
        auth: { token },
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Socket connected", socketRef.current?.id);
      });

      socketRef.current.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  return socketRef.current;
};
