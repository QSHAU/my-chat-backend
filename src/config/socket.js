import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("Клиент подключился:", socket.id);

        socket.on("joinChat", (chatId) => {
            socket.join(`chat_${chatId}`);
        });

        socket.on("leaveChat", (chatId) => {
            socket.leave(`chat_${chatId}`);
            console.log(`Пользователь ${socket.id} покинул комнату chat_${chatId}`);
        });

        socket.on("disconnect", () => {
            console.log("Клиент отключился:", socket.id);
        });
    });

    return io;
};

export { io };