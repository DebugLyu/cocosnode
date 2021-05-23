export interface ILyuConfig {
    name: string,
    port: number,
}

/**
 * 连接redis 
 */
export interface IRedisConfig {
    // redis host
    host: string,
    port?: number,
    // 如果存在账号密码验证
    user?: string,
    password?: string,
}

/** 
 * 存储服务数据
 */
export interface IService {
    host: string,
    name: string,
    port: number,
}

/**
 * 服务器内部消息数据格式
 */
export interface lyuData {
    func: string,
    message: string,
}