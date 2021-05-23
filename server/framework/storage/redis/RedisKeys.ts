export class RedisKeys {
    public static SystemDB: number = 9;

    public static getServiceGroupKeys(name: string) {
        return `S:LIST:${name}`;
    }
}