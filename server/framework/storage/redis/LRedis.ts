import { IRedisConfig } from "../../etc/LyuInterface";
import { Redis } from "./redis";
import { RedisKeys } from "./RedisKeys";

class LyuRedis extends Redis {
    start(config: IRedisConfig) {
        this.options.host = config.host;
        this.options.db = RedisKeys.SystemDB;
        config.password && (this.options.password = config.password);
        config.user && (this.options.username = config.user);

        this.connect();
    }
}

const LRedis = new LyuRedis();

export default LRedis;