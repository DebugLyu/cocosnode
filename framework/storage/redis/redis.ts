import IORedis from "ioredis";

export interface RedisConfig extends IORedis.RedisOptions {

}

export class redis {
    private rds: IORedis.Redis;

    constructor(config?: RedisConfig) {
        this.rds = new IORedis(config);
    }

    select(index: number) {
        this.rds.select(index);
    }
}