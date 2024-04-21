import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { appTitle, appVersion } from './config';
import swagger from './swagger';
import { addRouteV1 } from './v1';

const app = new Elysia();

app
  .use(swagger())
  .use(cors())
  .get('/', () => `${appTitle} v${appVersion} is running`)
  .all('/v0', ({ error }) => error(410, 'Gone'));

//* note: each version should be added as a separate module
addRouteV1(app);

app.all('*', ({ error }) => error(404, 'Not Found'));
app.listen(9000);

console.info(`${appTitle} v${appVersion} is running at https://${app.server?.hostname}:${app.server?.port}`);
