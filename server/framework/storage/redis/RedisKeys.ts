export class RedisKeys {
    public static SystemDB: number = 9;

    public static getServiceGroupKeys() {
        return `S:LIST`;
    }
}