import { RedisClientType } from "redis";
import { promisify } from "util";

export default class RedisClientWrapper {
  constructor(private client: RedisClientType) {}
  async deleteKeys(pattern: string): Promise<void> {
    const scanAsync = promisify(this.client.scan).bind(this.client);
    const delAsync = promisify(this.client.del).bind(this.client);

    let cursor = "0";
    // at least scan once
    do {
      const result = await scanAsync(cursor, "MATCH", pattern);
      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        await delAsync(keys);
      }
      // cursor = "0" means the db has been completely scanned
    } while (cursor !== "0");
  }
}
