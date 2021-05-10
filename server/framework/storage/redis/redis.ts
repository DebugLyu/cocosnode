import IORedis from "ioredis";

export interface RedisConfig extends IORedis.RedisOptions {

}

export class Redis {
    private rds: IORedis.Redis;

    constructor(config?: RedisConfig) {
        this.rds = new IORedis(config);
    }

    /**
     * 设置操作存储库的索引
     * @param index redis 数据库索引
     */
    select(index: number) {
        this.rds.select(index);
    }

    /**
     * 获取存储信息
     * @param key 储存key
     * @returns 存储的值
     */
    async get(key: string | number) {
        return await this.rds.get((key).toString());
    }

    /** 
     * 获取值
     * @param key key
     * @param value 数值
     * @param expiryTime 过期时间 秒
     */
    async set(key: string | number, value: string, expiryTime?: number) {
        expiryTime == null ?
            await this.rds.set((key).toString(), value) :
            await this.rds.set((key).toString(), value, "EX", expiryTime);
    }
}