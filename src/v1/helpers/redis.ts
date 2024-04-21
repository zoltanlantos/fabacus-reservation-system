import { createClient } from 'redis';
import { removeEmptyProperties } from './misc';

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

export const redisGet = async (key: string) => {
  const redis = await redisConnect();
  const data = await redis.get(key);
  await redis.quit();
  return data;
};

export const redisSetAdd = async (key: string, data: unknown) => {
  const redis = await redisConnect();
  const cleanedData = removeEmptyProperties(data as Record<string, unknown>);
  await redis.sAdd(key, JSON.stringify(cleanedData));
  await redis.quit();
};

export const redisSetMembers = async (key: string) => {
  const redis = await redisConnect();
  const data = await redis.sMembers(key);
  await redis.quit();
  return data.map((item) => JSON.parse(item));
};
