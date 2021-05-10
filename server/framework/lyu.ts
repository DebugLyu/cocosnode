import { Redis } from "./storage/redis/Redis";

export class lyu {
    public lyuRedis: Redis;
    constructor() {
        this.lyuRedis = new Redis({
            host: "",
        });
    }
}