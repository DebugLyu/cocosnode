import os = require("os");
import net = require("net");
import http = require("http");
import { lMath } from "./lMath";


export namespace utils {
    /**
     * 获得本地 IP地址
     */
    export function getLocalIP(): string {
        var interfaces = os.networkInterfaces();
        for (var devName in interfaces) {
            var iface = interfaces[devName];
            if (!iface) {
                continue;
            }
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
        return "";
    }

    /**
     * 通过http请求获取 客户端IP地址
     * @param req http请求
     */
    export function getClientIP(req: any) {
        let ip = req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
            req.ip ||
            req.connection.remoteAddress || // 判断 connection 的远程 IP
            req.socket.remoteAddress || // 判断后端的 socket 的 IP
            req.connection.socket.remoteAddress || ''
        if (ip) {
            ip = ip.replace('::ffff:', '')
        }
        return ip;
    }

    /**
     * 获得 服务器自身网络 IP地址
     */
    export async function getNetIP() {
        return new Promise<string>((resolve, rejects) => {
            const url = 'http://pv.sohu.com/cityjson?ie=utf-8'
            http.get(url, res => {
                let data = ''
                res.on('data', chunk => data += chunk)
                res.on('end', () => {
                    data += "returnCitySN;";
                    let t = eval(data);
                    resolve(t["cip"]);
                })
            }).on('error', e => console.log(`error messsage: ${e.message}`));
        });

    }

    /**
     * 检查端口是否被占用
     * @param port 待检测端口
     */
    export async function portInUse(port: number) {
        return new Promise<number>((resolve, reject) => {
            let server = net.createServer().listen(port);
            server.on('listening', function () {
                server.close();
                resolve(port);
            });
            server.on('error', function (err: Error) {
                if ((err as any)["code"] == 'EADDRINUSE') {
                    reject(err);
                }
            });
        });
    }

    /**
     * 获得一个未被占用的端口
     * @param port 检查端口
     */
    export const CheckPort = async function (port: number) {
        return new Promise<number>((resolve, reject) => {
            portInUse(port).then((port) => {
                resolve(port);
            }).catch(async (err) => {
                port++;
                resolve(await CheckPort(port));
            })
        });
    }

    /**
     * 时间格式化
     * @param fmt 格式化模板
     * @param date 时间
     */
    export function DateFmt(fmt: string = "yyyy-MM-dd HH:mm:ss", date: Date = new Date()) {
        var o = {
            "M+": date.getMonth() + 1, //月份           
            "d+": date.getDate(), //日           
            "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时           
            "H+": date.getHours(), //小时           
            "m+": date.getMinutes(), //分           
            "s+": date.getSeconds(), //秒           
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度           
            "S": date.getMilliseconds() //毫秒           
        };
        var week = {
            "0": "/u65e5",
            "1": "/u4e00",
            "2": "/u4e8c",
            "3": "/u4e09",
            "4": "/u56db",
            "5": "/u4e94",
            "6": "/u516d"
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + (week as any)[date.getDay() + ""]);
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? ((o as any)[k]) : (("00" + (o as any)[k]).substr(("" + (o as any)[k]).length)));
            }
        }
        return fmt;
    }

    /**
     * 深度拷贝
     * @param obj 拷贝对象
     */
    export function deepClone(obj: any) {
        let objClone: any = Array.isArray(obj) ? [] : {};
        if (obj && typeof obj === "object" && obj.hasOwnProperty) {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    //判断ojb子元素是否为对象，如果是，递归复制
                    if (obj[key] && typeof obj[key] === "object") {
                        objClone[key] = deepClone(obj[key]);
                    } else {
                        //如果不是，简单复制
                        objClone[key] = obj[key];
                    }
                }
            }
        }
        return objClone;
    }

    /**
     * 树状打印内容
     * @param obj 打印对象
     */
    function fdump(obj: any) {
        let ret: string = "";
        let t = 0;
        let repeat = (str: string, n: number) => {
            return new Array(n).join(str);
        }

        let adump = (object: any) => {
            t++;
            if (object && typeof object === "object") {
                ret += "\n";
                for (const key in object) {
                    if (Object.prototype.hasOwnProperty.call(object, key)) {
                        const value = object[key];
                        if (value && typeof value === "object") {
                            let isa = Array.isArray(value);
                            ret += repeat('\t', t) + key + ':' + (isa ? '[' : '{') + "\n";
                            adump(value);
                            t--;
                            ret += repeat('\t', t) + (isa ? ']' : '}') + "\n";
                        } else {
                            ret += repeat('\t', t) + key + ':' + value + "\n";
                        }
                    }
                }
            } else {
                ret += repeat('\t', t) + object + "\n";
            }
        }
        adump(obj);
        ret = ret.slice(0, -1);
        return ret;
    }

    /**
     * 安全解析JSON对象
     * @param obj 解析对象
     */
    export function safeJson(obj: string) {
        try {
            if (typeof obj == "string") {
                if (obj.length > 0 && (obj[0] == "[" || obj[0] == "{")) {
                    return eval("(" + obj + ")"); //JSON.parse(obj);
                }
                return obj;
            }
            return obj
        } catch (e) {
            return obj;
        }
    }

    /**
     * 树状打印内容 
     * @param args 树状打印对象
     */
    export function dump(...args: any[]) {
        let ret = "";

        for (let i = 0; i < args.length; i++) {
            const value = args[i];
            ret += fdump(value)
        };
        return ret;
    }

    /**
     * 检查对象是否为空
     * @param obj 检查对象
     */
    export function empty(obj: any) {
        if (obj == null || obj == undefined) {
            return true;
        }
        if (typeof obj === 'object') {
            return Object.keys.length == 0;
        }

        if (typeof obj == "number" && isNaN(obj)) {
            return true;
        }

        if (typeof obj == "string") {
            return obj == "";
        }

        return false;
    }


    // 函数参数必须是字符串，因为二代身份证号码是十八位，而在javascript中，十八位的数值会超出计算范围，造成不精确的结果，导致最后两位和计算的值不一致，从而该函数出现错误。
    // 详情查看javascript的数值范围
    export function checkIDCard(idcode: string) {
        // 加权因子
        var weight_factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        // 校验码
        var check_code = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

        var code = idcode + "";
        var last = idcode[17];//最后一位

        var seventeen = code.substring(0, 17);

        // ISO 7064:1983.MOD 11-2
        // 判断最后一位校验码是否正确
        var arr = seventeen.split("");
        var len = arr.length;
        var num = 0;
        for (var i = 0; i < len; i++) {
            num = num + Number(arr[i]) * weight_factor[i];
        }

        // 获取余数
        var resisue = num % 11;
        var last_no = check_code[resisue];

        // 格式的正则
        // 正则思路
        /*
        第一位不可能是0
        第二位到第六位可以是0-9
        第七位到第十位是年份，所以七八位为19或者20
        十一位和十二位是月份，这两位是01-12之间的数值
        十三位和十四位是日期，是从01-31之间的数值
        十五，十六，十七都是数字0-9
        十八位可能是数字0-9，也可能是X
        */
        var idcard_patter = /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/;

        // 判断格式是否正确
        var format = idcard_patter.test(idcode);

        // 返回验证结果，校验码和格式同时正确才算是合法的身份证号码
        return last === last_no && format ? true : false;
    }

    /**
     * 检查身份证号是否满18岁
     * @param idcode 身份号
     */
    export function checkAge18(idcode: string) {
        if (idcode == null || idcode == "" || idcode.length < 10) {
            return false;
        }
        let t = idcode.substr(6, 4);
        let date = new Date(Date.now());
        let y = date.getFullYear();
        let age = y - Number(t);
        return age >= 18;
    }


    /**
     * 随机选择一个内容返回
     * @param list 列表 Object 或者 Array
     */
    export function randomList(list: any) {
        let l = [];
        if (Array.isArray(list)) {
            l = list;
        } else {
            l = Object.values(list);
        }
        if (l.length <= 0) {
            return null;
        }
        let r = lMath.random(0, l.length - 1);
        return l[r];
    }


    /**
     * 获取一个随机数组项
     * @param array
     */
    export function getRandomArrayItem<T>(array: Array<T>): T {
        return array[Math.trunc(Math.random() * array.length)]
    }

    /** 随机字符数组,默认去掉了容易混淆的字符oO/9gq/Vv/Uu/LlI1 */
    const RANDOM_CHAR = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"

    /**
     * 随机字符串
     * @param length
     */
    export function getRandomString(length: number): string {
        let result = []
        for (let i = 0; i < length; i += 1) {
            result.push(RANDOM_CHAR[Math.trunc(Math.random() * RANDOM_CHAR.length)])
        }
        return result.join("");
    }

    /**
     * 采用洗牌算法打乱数组顺序,不更改原数组,返回一个打乱顺序的新数组
     * - 采用遍历+替换的方式。在数量级很大时,可能会有性能损耗
     * @param array
     */
    export function shuffleArray<T>(array: Array<T>): Array<T> {
        let result = [...array]
        for (let i = 0; i < result.length; i += 1) {
            let t = Math.trunc(Math.random() * result.length);
            [result[i], result[t]] = [result[t], result[i]];
        }
        return result
    }

    export function toChineseNum(num: number): string {
        let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']; //changeNum[0] = "零"
        let unit = ["", "十", "百", "千", "万"];
        let getWan = (temp: number | string) => {
            let strArr = temp.toString().split("").reverse();
            let newNum = "";
            for (var i = 0; i < strArr.length; i++) {
                newNum = (i == 0 && strArr[i] == "0" ? "" : (i > 0 && strArr[i] == "0" && strArr[i - 1] == "0" ? "" : changeNum[Number(strArr[i])] + (strArr[i] == "0" ? unit[0] : unit[i]))) + newNum;
            }
            return newNum;
        }
        let overWan = Math.floor(num / 10000);
        let noWan = num % 10000;
        let noWanStr = "";
        if (noWan.toString().length < 4) {
            noWanStr = "0" + noWan;
        }
        return overWan ? getWan(overWan) + "万" + getWan(noWanStr) : getWan(num);
    }

    export function isObjectValueEqual(a: any, b: any) {
        //取对象a和b的属性名
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);
        //判断属性名的length是否一致
        if (aProps.length != bProps.length) {
            return false;
        }
        //循环取出属性名，再判断属性值是否一致
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            if (a[propName] !== b[propName]) {
                return false;
            }
        }
        return true;
    }
}