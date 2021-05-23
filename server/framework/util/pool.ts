
export default class Pool<T> {
    private dataList: Array<T> = [];
    private baseType: new() => T;

    constructor(t: new () => T, num = 50){
        this.baseType = t;
        for (let i = 0; i < num; i++) {
            this.dataList.push(new t());
        }
    }

    get(): T {
        let t = this.dataList.shift();
        if(!t){
            t = new this.baseType();
        }
        return t;
    }

    put(obj: T) {
        this.dataList.push(obj);
    }
}