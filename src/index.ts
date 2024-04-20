import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { appTitle } from './config';
import swagger from './swagger';

const app = new Elysia();

app
  .use(swagger)
  .use(cors())
  .get('/', () => `${appTitle} is running`)
  .all('/v0', ({ error }) => error(410, 'Gone'))
  .all('*', ({ error }) => error(404, 'Not Found'));
  
app.listen(9000);

console.info(`${appTitle} is running at https://${app.server?.hostname}:${app.server?.port}`);
