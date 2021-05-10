import ws from "ws";
import { IWsConfig } from "./IWs";

export class WebSocketClient {
    /**
     * websocket 节点
     */
    private ws: ws;
    /** 
     * 是否连接成功
     */
    private isConnected: boolean = false;

    constructor(config: IWsConfig) {
        this.ws = new ws(`ws://${config.host}:${config.port}`);
        this.init();
    }

    private init() {
        this.ws.on("error", (err: Error) => {
            this.onClose();
        });

        this.ws.on("open", () => {
            this.isConnected = true;
            this.onOpen();
        });

        this.ws.on("close", (code: number, reason: string) => {
            this.onClose();
        });

        this.ws.on("message", (data: ws.Data) => {
            this.onData(data);
        });
    }

    onClose() {
        this.isConnected = false;
        this.ws.close();
    }

    onOpen() {

    }

    onData(data: ws.Data) {

    }
}