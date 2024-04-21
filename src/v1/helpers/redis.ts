import { redisUrl } from '@/config';
import { createClient } from 'redis';

//* note: let redis requests throw errors to be handled by the caller
export const redisConnect = async () => await createClient({ url: redisUrl }).connect();
