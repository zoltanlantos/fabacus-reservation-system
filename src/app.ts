import { appTitle, appVersion } from '@/config';
import cors from '@/v1/plugins/cors';
import swagger from '@/v1/plugins/swagger';
import { user } from '@/v1/plugins/user';
import { addRoutesV1 } from '@/v1/routes';
import { Elysia } from 'elysia';

const app = new Elysia();

app
  // todo: .use(logger())
  .use(swagger())
  .use(cors())
  .use(user())
  .get(
    '/',
    ({ set }) => {
      set.redirect = '/swagger';
    },
    { detail: { description: 'Redirect to Swagger UI', tags: ['misc'] } },
  )
  .get('/health', () => ({ status: 'ok' }), { detail: { description: 'Health check endpoint.', tags: ['misc'] } })
  //* note: example of how to deprecate a version
  .all('/v0', ({ error }) => error(410, 'Gone'));

//* note: each version should be added as a separate module
addRoutesV1(app);

app.all('*', ({ error }) => error(404, 'Not Found'));

app.listen(9000);

console.info(`${appTitle} v${appVersion} is running at https://${app.server?.hostname}:${app.server?.port}`);
