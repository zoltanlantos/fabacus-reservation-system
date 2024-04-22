import { appTitle, appVersion } from '@/config';
import { auth } from '@/v1/plugins/auth';
import cors from '@/v1/plugins/cors';
import swagger from '@/v1/plugins/swagger';
import { addRoutesV1 } from '@/v1/routes';
import { Elysia } from 'elysia';

const app = new Elysia();

app
  // todo: .use(logger())
  .use(swagger())
  .use(cors())
  .use(auth())
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

/**
 * Design notes: Wrapping the app src in a versioned route allows for easy versioning and deprecation of endpoints.
 * New versions can be added by copying the previous version's folder before introducing breaking changes.
 */
addRoutesV1(app);

app.all('*', ({ error }) => error(404, 'Not Found'));

app.listen(9000);

console.info(`${appTitle} v${appVersion} is running at https://${app.server?.hostname}:${app.server?.port}`);
