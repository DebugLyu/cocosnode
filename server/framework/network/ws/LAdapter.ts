import ws from "ws";
import { WebSocketServer } from "./WebSocketServer";
import { agent } from "./agent";
import LRedis from "../../storage/redis/LRedis";
import { RedisKeys } from "../../storage/redis/RedisKeys";
import g from "../../common/g";
import { IService, lyuData } from "../../etc/LyuInterface";
import { utils } from "../../util/utils";

// import schedule from "node-schedule";
var log = console.log;

var __Call_Back_Seed__ = 1000;
const __Default_FuncID__ = 1000;
const __Send_Key__ = 100000;

class Adapter extends WebSocketServer {
    private agentList: agent[] = [];
    private agentNameMap: { [x: string]: agent } = {};
    private timeOutList: { [x: number]: number } = {};
    private callbackList: { [id: number]: (res: any) => void } = {};

    /** 
     * 事件列表
     */
    funcList: { [x: string]: Function } = {};

    private dt = 0;

    start(port: number) {
        this.listen(port);

        this.refresh();
        this.update();
    }

    private async update() {
        this.dt++;
        setTimeout(this.update.bind(this), 1000);
    }

    private async refresh() {
        await LRedis.set(RedisKeys.getServiceGroupKeys(g.name), JSON.stringify({
            name: g.name,
            port: g.port,
            host: g.host,
        }));
        await LRedis.expire(RedisKeys.getServiceGroupKeys(g.name), 60);

        let serviceList = await LRedis.keys(RedisKeys.getServiceGroupKeys("*"));
        for (let s in serviceList) {
            let service: IService = utils.safeJson(s);// JSON.parse(s);
            if (service) {
                // 如果存在连接，则跳过
                if (this.agentNameMap[service.name]) {
                    continue;
                }
                // 不存在的连接，建立连接
                let _agent = new agent();
                if (await _agent.connect(service.host, service.port)) {
                    this.agentNameMap[service.name] = _agent;
                    _agent.send("service", {
                        name: g.name,
                        host: g.host,
                        port: g.port,
                    });
                } else {
                    log(`[Adapter] 无法连接到服务[${service.name}], 连接地址:${service.port}:${service.port}`);
                }
            }
        }

        setTimeout(this.refresh.bind(this), 30 * 1000);
    }

    onConnection(socket: ws) {
        // TODO: 处理重复连接
        let _agent = new agent(socket);
        socket.on("message", (w: ws, data: ws.Data) => {
            // _agent.onMessage(data);
            this.onReceive(_agent, data);
        });

        socket.on("close", (w: ws, code: number, reason: string) => {
            _agent.onClose(code, reason);
        });

        let index = this.agentList.push(_agent);
        _agent.index = index - 1;
    }

    /**
     * 服务器关闭
     */
    onClose() {

    }

    onAgentClose(index: number) {
        if (this.agentList[index]) {
            this.agentList.splice(index, 1);
        }
    }

    onAgentCallback(ag: agent, data: IService) {
        this.agentNameMap[data.name] = ag;
    }

    register(cmd: string, func: Function) {
        this.funcList[cmd] = func;
    }

    onReceive(ag: agent, data: ws.Data) {
        let m = data as string;
        let res: lyuData = JSON.parse(m);
        if (this.funcList[res.func]) {
            this.funcList[res.func](res.message);
        } else {
            log(`[agent] 注册函数不存在：${res.func}`);
        }
    }

    send(name: string, func: string, data: any) {
        let agent = this.agentNameMap[name];
        if (agent) {
            agent.send(func, data);
        }
    }

    call(name: string, func: string, data: any, callback: (res: any) => void, timeout: number) {
        __Call_Back_Seed__++;
        // 避免消息号过多
        if (__Call_Back_Seed__ >= __Send_Key__) {
            __Call_Back_Seed__ = __Default_FuncID__;
        }
        let funcid = __Call_Back_Seed__ + __Send_Key__;
        this.callbackList[__Call_Back_Seed__] = callback;
        if (timeout != 0) {
            this.timeOutList[__Call_Back_Seed__] = this.dt + timeout;
        }
        // this.emit(name, buffer);
        let agent = this.agentNameMap[name];
        if (agent) {
            data[funcid] = funcid;
            agent.send(func, data);
        }
    }


}

export const LAdapter = new Adapter();