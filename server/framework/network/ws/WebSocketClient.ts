import ws from "ws";
import { IWsConfig } from "./IWs";

export class WebSocketClient extends ws {
    /** 
     * 是否连接成功
     */
    private isConnected: boolean = false;

    constructor(config: IWsConfig) {
        super(`ws://${config.host}:${config.port}`);
        this.init();
    }

    private init() {
        this.on("error", (err: Error) => {
            this.onClose();
        });

        this.on("open", () => {
            this.isConnected = true;
            this.onOpen();
        });

        this.on("close", (code: number, reason: string) => {
            this.onClose();
        });

        this.on("message", (data: ws.Data) => {
            this.onData(data);
        });
    }

    onClose() {
        this.isConnected = false;
        this.close();
    }

    onOpen() {

    }

    onData(data: ws.Data) {

    }
}