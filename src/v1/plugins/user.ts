import Elysia, { t } from 'elysia';
import jwt from './jwt';

export const user = () =>
  new Elysia()
    .use(jwt())
    .derive(async ({ headers, jwt }) => {
      const token = headers.authorization?.replace(/^Bearer /, '');
      return { user: token && (await jwt.verify(token)) };
    })
    //* note: functional requirements doesn't specify authentication, so I added a simple jwt sign endpoint
    .get('/jwt', async ({ jwt, query }) => ({ Authorize: `Bearer ${await jwt.sign({ ...query })}` }), {
      query: t.Object({ name: t.String({ minLength: 1 }), id: t.String({ minLength: 1 }) }),
    })
    .get('/user', ({ user }) => user);
