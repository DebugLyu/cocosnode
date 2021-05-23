import ws from "ws";

export class WebSocketServer extends ws.Server {
    private wsList: ws[] = [];
    private isListenning: boolean = false;
    private port: number = 0;

    listen(port: number) {
        this.on("close", () => {
            this.onClose();
        });

        this.on("connection", (socket) => {
            this.onConnection(socket);
        });

        this.on("error", (error) => {
            this.onClose();
        });

        this.on("listening", () => {
            this.port = port;
        });
    }

    onConnection(socket: ws) {

    }

    onMessage(data: ws.Data) {

    }

    onClose() {

    }
}