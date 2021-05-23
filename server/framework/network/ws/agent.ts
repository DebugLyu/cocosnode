import ws from "ws";
import { IService, lyuData } from "../../etc/LyuInterface";
import { LAdapter } from "./LAdapter";
import { WebSocketClient } from "./WebSocketClient";

var log = console.log;

export class agent {
    /**
     * 索引
     */
    index: number = 0;
    /** 
     * 代理名称
     */
    name: string = "";
    /** 
     * 事件列表
     */
    funcList: { [x: string]: Function } = {};
    /**
     * socket 节点
     */
    webScock !: ws;
    /**
     * 创建事件
     */
    createTime: number = 0;
    /**
     * 
     */
    host: string = "";
    port: number = 0;

    constructor(socket?: ws) {
        if (socket) {
            this.webScock = socket;
            // TODO: 这里要补充 url 到 host 和port 的定义
        }
        this.createTime = Date.now();
        this.register("service", (data: IService) => {
            this.name = data.name;
            this.host = data.host;
            this.port = data.port;
            LAdapter.onAgentCallback(this, data);
        });
    }

    async connect(host: string, port: number) {
        return new Promise<boolean>((resolve, reject) => {
            let webScock = new ws(`ws://${host}:${port}`);
            webScock.on("open", (wsocket: ws) => {
                this.webScock = wsocket;
                resolve(true);
            });
            webScock.on("error", () => {
                resolve(false);
            });
            webScock.on("close", () => {
                resolve(false);
            });
            webScock.on("message", (wsocket: ws, data: ws.Data) => {
                this.onMessage(data)
                resolve(true);
            });
        });
    }

    register(cmd: string, func: Function) {
        this.funcList[cmd] = func;
    }

    /**
     * 接收到客户端的数据
     * @param msg 数据内容
     */
    onMessage(msg: ws.Data) {
        let m = msg as string;
        let res: lyuData = JSON.parse(m);
        if (this.funcList[res.func]) {
            this.funcList[res.func](res.message);
        } else {
            log(`[agent] 注册函数不存在：${res.func}`);
        }
    }

    /**
     * 客户端节点关闭
     */
    onClose(code: number, reason: string) {
        LAdapter.onAgentClose(this.index);
    }

    send(msg: string | lyuData, data?: any) {
        let t: lyuData | string = msg;
        if (typeof msg == "string") {
            t = {
                func: msg,
                message: data,
            }
        }
        this.webScock.send(JSON.stringify(t), { compress: true });
    }
}