import Elysia, { t } from 'elysia';
import { userStore } from './userStore';

//* note: functional requirements doesn't specify authentication,
//* added a simple JWT creation endpoint as a stopgap solution to enable easier testing
export const auth = () =>
  new Elysia()
    .use(userStore())
    .post('/jwt', async ({ jwt, body }) => ({ Authorize: `Bearer ${await jwt.sign({ ...body })}` }), {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        id: t.String({ minLength: 1 }),
        role: t.Optional(t.String({ enum: ['admin', 'patron'] })),
      }),
      detail: {
        description:
          'Use this endpoint to generate a dummy JWT. Use this token as the Authorization Bearer for the /events/ requests.\n\n' +
          'The role field is optional and can be either "admin" or "patron" (defaults to "patron").\n\n' +
          'Use admin to be able to  create new events and either patron or admin to list, hold and reserve seats.',
        tags: ['auth'],
      },
    })
    .get(
      '/user',
      ({ error, store }) => store.user || error(401, { error: 'Unauthorized', message: 'Missing or invalid token' }),
      { detail: { description: 'Use this endpoint to check and validate the JWT.', tags: ['auth'] } },
    );
