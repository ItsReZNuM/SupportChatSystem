import { io } from "socket.io-client";

let socket;

export function getSocket({ guest_id = null, token = null }) {
    if (!socket) {
        const auth = token ? { token } : { guest_id };
        socket = io("http://localhost:8000", {
            transports: ["websocket"],
            auth,
            autoConnect: true,
        });
        return socket;
    }
    return socket;
}

export function disconnectSocket() {
    if (!socket) return;
    socket.disconnect();
    socket = null;
}
