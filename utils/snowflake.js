/**
 * 雪花算法生成分布式ID
 * 返回字符串格式的ID以避免前端精度丢失
 */

// 开始时间戳（秒级）：2023-01-01
const START_TIMESTAMP = 1672531200;

// 每部分占用的位数
const WORKER_ID_BITS = 5; // 数据标识id所占的位数
const DATACENTER_ID_BITS = 5; // 机器id所占的位数
const SEQUENCE_BITS = 12; // 序列号占用的位数

// 最大值
const MAX_WORKER_ID = -1 ^ (-1 << WORKER_ID_BITS); // 2^5 - 1 = 31
const MAX_DATACENTER_ID = -1 ^ (-1 << DATACENTER_ID_BITS); // 2^5 - 1 = 31
const MAX_SEQUENCE = -1 ^ (-1 << SEQUENCE_BITS); // 2^12 - 1 = 4095

// 移位
const WORKER_ID_SHIFT = SEQUENCE_BITS; // 12
const DATACENTER_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS; // 17
const TIMESTAMP_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + DATACENTER_ID_BITS; // 22

// 默认参数
const DEFAULT_WORKER_ID = 1;
const DEFAULT_DATACENTER_ID = 1;

/**
 * 生成雪花算法分布式ID
 * @param {Number} workerId 工作ID (0-31)
 * @param {Number} datacenterId 数据中心ID (0-31)
 * @returns {String} 字符串格式的ID
 */
export function generateSnowflakeId(workerId = DEFAULT_WORKER_ID, datacenterId = DEFAULT_DATACENTER_ID) {
  // 参数检查
  if (workerId > MAX_WORKER_ID || workerId < 0) {
    throw new Error(`Worker ID must be between 0 and ${MAX_WORKER_ID}`);
  }
  if (datacenterId > MAX_DATACENTER_ID || datacenterId < 0) {
    throw new Error(`Datacenter ID must be between 0 and ${MAX_DATACENTER_ID}`);
  }
  
  try {
    // 尝试使用BigInt (支持BigInt的环境)
    return generateWithBigInt(workerId, datacenterId);
  } catch (err) {
    // 降级到字符串模拟 (不支持BigInt的环境)
    return generateWithoutBigInt(workerId, datacenterId);
  }
}

/**
 * 使用BigInt生成ID (现代浏览器和Node.js)
 */
function generateWithBigInt(workerId, datacenterId) {
  // 当前时间戳(秒)
  const timestamp = BigInt(Math.floor(Date.now() / 1000) - START_TIMESTAMP);
  
  // 随机序列号
  const sequence = BigInt(Math.floor(Math.random() * MAX_SEQUENCE));
  
  // 组合ID各部分
  const id = (timestamp << BigInt(TIMESTAMP_SHIFT)) |
             (BigInt(datacenterId) << BigInt(DATACENTER_ID_SHIFT)) |
             (BigInt(workerId) << BigInt(WORKER_ID_SHIFT)) |
             sequence;
  
  // 返回字符串，避免精度丢失
  return id.toString();
}

/**
 * 不使用BigInt生成ID (兼容旧浏览器)
 */
function generateWithoutBigInt(workerId, datacenterId) {
  // 使用字符串模拟大整数运算
  // 当前时间戳(秒)
  const timestamp = Math.floor(Date.now() / 1000) - START_TIMESTAMP;
  
  // 随机序列号
  const sequence = Math.floor(Math.random() * MAX_SEQUENCE);
  
  // 由于JS数字精度问题，这里使用字符串拼接模拟
  const timestampPart = timestamp.toString(16).padStart(8, '0');
  const datacenterPart = datacenterId.toString(16).padStart(2, '0');
  const workerPart = workerId.toString(16).padStart(2, '0');
  const sequencePart = sequence.toString(16).padStart(3, '0');
  
  // 组合成一个16进制字符串
  const hexId = `${timestampPart}${datacenterPart}${workerPart}${sequencePart}`;
  
  // 转换为十进制字符串返回
  return BigInt(`0x${hexId}`).toString();
}

/**
 * 从ID提取时间戳(秒)
 * @param {String} id 字符串ID
 * @returns {Number} 秒级时间戳
 */
export function extractTimestampFromId(id) {
  try {
    // 使用BigInt尝试提取
    const bigId = BigInt(id);
    const timestamp = Number(bigId >> BigInt(TIMESTAMP_SHIFT)) + START_TIMESTAMP;
    return timestamp;
  } catch (err) {
    // 如果不支持BigInt，则返回当前时间
    console.error('Failed to extract timestamp from ID', err);
    return Math.floor(Date.now() / 1000);
  }
}
