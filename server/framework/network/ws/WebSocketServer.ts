import ws from "ws";

export class WebSocketServer {
    private server!: ws.Server;
    private wsList: ws[] = [];
    private isListenning: boolean = false;
    private port: number = 0;


    // private init() {

    // }

    listen(port: number) {
        this.server = new ws.Server({ port: port });
        this.server?.on("close", () => {
            this.close();
        });

        this.server.on("connection", (socket) => {

        });

        this.server.on("error", (error) => {
            this.close();
        });

        this.server.on("listening", () => {
            this.port = port;
        });
    }

    onConnection() {

    }

    close() {

    }
}