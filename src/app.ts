import { appTitle, appVersion } from '@/config';
import cors from '@/v1/plugins/cors';
import jwt from '@/v1/plugins/jwt';
import swagger from '@/v1/plugins/swagger';
import { addRoutesV1 } from '@/v1/routes';
import { Elysia, t } from 'elysia';

const app = new Elysia();

app
  // todo: .use(logger())
  .use(swagger())
  .use(cors())
  .use(jwt())
  .derive(async ({ headers, jwt }) => {
    const token = headers.authorization?.replace(/^Bearer /, '');
    return { user: token && (await jwt.verify(token)) };
  })
  .get('/', ({ set }) => {
    set.redirect = '/v1/swagger';
  })
  //* note: functional requirements doesn't specify authentication, so I added a simple jwt sign endpoint
  .get('/jwt', async ({ jwt, query }) => ({ Authorize: `Bearer ${await jwt.sign({ ...query })}` }), {
    query: t.Object({ name: t.String({ minLength: 1 }), id: t.String({ minLength: 1 }) }),
  })
  .get('/user', ({ user }) => user)
  .get('/health', () => ({ status: 'ok' }))
  //* note: example of how to deprecate a version
  .all('/v0', ({ error }) => error(410, 'Gone'));

//* note: each version should be added as a separate module
addRoutesV1(app);

app.all('*', ({ error }) => error(404, 'Not Found'));

app.listen(9000);

console.info(`${appTitle} v${appVersion} is running at https://${app.server?.hostname}:${app.server?.port}`);
