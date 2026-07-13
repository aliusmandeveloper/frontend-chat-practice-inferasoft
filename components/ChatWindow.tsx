"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

interface ChatWindowProps {
    selectedUser: any;
}
export default function ChatWindow({ selectedUser }: ChatWindowProps) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    useEffect(() => {
        socket.on("receiveMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.off("receiveMessage");
        }
    }, []);
    const sendMessage = () => {
        socket.emit("sendMessage", message);
        setMessage("");
    };
    return (
        <div className="w-2/3 h-screen flex flex-col">
            <div className="p-4 border-b">
                {selectedUser?.name || "Select User"}
            </div>
            <div className="flex-1 p-4">
                {messages.map((msg, i) =>
                    <div key={i}>{msg}</div>
                )}
            </div>
            <div className="p-4 border-t">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="border p-2 w-4/5"
                />

                <button
                    onClick={sendMessage}
                    className="ml-2 bg-black text-white px-4 py-2"
                >Send
                </button>
            </div>
        </div>
    )
}