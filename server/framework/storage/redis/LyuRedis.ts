import { Redis } from "./Redis";
import { RedisKeys } from "./RedisKeys";

const LyuRedis = new Redis();
LyuRedis.select(RedisKeys.SystemDB);
export default LyuRedis;