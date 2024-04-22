import { jwtSecret } from '@/config';
import { jwt } from '@elysiajs/jwt';
import Elysia from 'elysia';

export type User = { id: string; name: string; role: 'admin' | 'patron' } | undefined;

export const userStore = () => {
  if (!jwtSecret) throw new Error('JWT secret is not defined');

  return new Elysia()
    .use(jwt({ name: 'jwt', secret: jwtSecret }))
    .state('user', undefined as User)
    .onRequest(async (ctx) => {
      const token = ctx.request.headers.get('authorization')?.replace(/^Bearer /, '');
      if (token) {
        const verified = await ctx.jwt.verify(token);
        if (verified) {
          ctx.store.user = {
            id: String(verified.id),
            name: String(verified.name),
            role: String(verified.role) === 'admin' ? 'admin' : 'patron',
          };
        }
      }
    });
};
