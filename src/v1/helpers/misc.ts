import type Elysia from 'elysia';

export type GetHandler = Parameters<Elysia['get']>;
export type PostHandler = Parameters<Elysia['post']>;
export type PutHandler = Parameters<Elysia['put']>;

//* note: removing empty props can reduce the overall size of the serialized data stored in redis
export const removeEmptyProperties = <T>(data: Record<string, unknown>) => {
  const cleanedData: Record<string, T> = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key] as T;
      if (value !== null && value !== undefined && value !== '') {
        cleanedData[key] = value;
      }
    }
  }
  return cleanedData;
};
