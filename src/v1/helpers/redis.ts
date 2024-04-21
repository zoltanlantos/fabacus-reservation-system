import { createClient } from 'redis';

//* note: let redis requests throw errors to be handled by the caller
export const redisConnect = async () =>
  await createClient({
    // todo: use env variables
    url: 'redis://localhost:6379',
  }).connect();

// todo: move redis connect to a middleware
export const redisSet = async (key: string, data: unknown, expires?: number) => {
  const redis = await redisConnect();
  const cleanedData = removeEmptyProperties(data as Record<string, unknown>);
  await redis.set(key, JSON.stringify(cleanedData));
  await redis.quit();
};

//* note: removing empty props can reduce the overall size of the serialized data stored in redis
export const removeEmptyProperties = (data: Record<string, unknown>) => {
  const cleanedData: Record<string, unknown> = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      if (value !== null && value !== undefined && value !== '') {
        cleanedData[key] = value;
      }
    }
  }
  return cleanedData;
};
