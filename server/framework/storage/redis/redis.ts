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

    async get(key: string | number) {
        return await this.rds.get((key).toString());
    }

    async set(key: string | number, value: string, expiryTime?: number) {
        expiryTime == null ?
            await this.rds.set((key).toString(), value) :
            await this.rds.set((key).toString(), value, "EX", expiryTime);
    }
}