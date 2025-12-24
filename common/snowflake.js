export function generateSnowflakeId() {
	if (typeof BigInt === 'undefined') {
		const ts = Date.now().toString()
		const rand = Math.floor(Math.random() * 1e9)
		return ts + String(rand).padStart(9, '0')
	}

	const epoch = 1700000000000n
	const now = BigInt(Date.now())
	let ts = now - epoch
	if (ts < 0n) ts = 0n

	const workerIdBits = 5n
	const sequenceBits = 12n

	const workerId = 1n
	const datacenterId = 1n
	const sequence = BigInt(Math.floor(Math.random() * 4096))

	const id =
		(ts << (workerIdBits + workerIdBits + sequenceBits)) |
		(datacenterId << (workerIdBits + sequenceBits)) |
		(workerId << sequenceBits) |
		sequence

	return id.toString()
}
