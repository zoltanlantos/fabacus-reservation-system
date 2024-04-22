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
      detail: {
        description:
          'Use this endpoint to generate a dummy JWT with a name and id. Use this token as the Authorization Bearer for the /events/ requests.',
        tags: ['auth'],
      },
    })
    .get('/user', ({ user }) => user, {
      detail: { description: 'Use this endpoint to check and validate the JWT.', tags: ['auth'] },
    });
