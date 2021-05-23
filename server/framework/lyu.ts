import g from "./common/g"
import { ILyuConfig } from "./etc/LyuInterface"
import { LAdapter } from "./network/ws/LAdapter";
import LRedis from "./storage/redis/LRedis";
import { utils } from "./util/utils";

class lyu {
    start(config: ILyuConfig) {
        g.name = config.name;
        g.port = config.port;

        let host = utils.getLocalIP();
        g.host = host;

        LRedis.start({ host: g.host });
        LAdapter.start(g.port);
    }

    exit(isAct: boolean) {
        if (isAct) {
            process.exit(0);
        }
    }

    call(name: string, funcname: string, data: any | null, callback: (res: any) => void): void;
    call(name: string, funcname: string, data: any | null, callback: (res: any) => void) {
        LAdapter.call(name, funcname, data, callback, 15);
    }

    async syncCall(name: string, funcname: string): Promise<any>;
    async syncCall(name: string, funcname: string, data: any | null): Promise<any>;
    async syncCall(name: string, funcname: string, data?: any) {
        return new Promise<any>((resolve, reject) => {
            LAdapter.call(name, funcname, data, (ret: any) => {
                resolve(ret);
            }, 15);
        });
    }

    send(name: string, funcname: string, data: any | null): void;
    send(name: string, funcname: string, data: any | null) {
        LAdapter.send(name, funcname, data);
    }
}

export default new lyu();