import { Elysia } from 'elysia';
import { appTitle, appVersion } from '@/config';
import cors from '@/v1/plugins/cors';
import jwt from '@/v1/plugins/jwt';
import swagger from '@/v1/plugins/swagger';
import { addRouteV1 } from '@/v1';

const app = new Elysia();

app
  .use(swagger())
  .use(cors())
  .use(jwt())
  //* note: functional requirements doesn't specify authentication, so I added a simple jwt example
  .get('/', ({jwt}) => `${appTitle} v${appVersion} is running, jwt: ${jwt.sign({name: 'John Doe'})}`)
  .all('/v0', ({ error }) => error(410, 'Gone'));

//* note: each version should be added as a separate module
addRouteV1(app);

app.all('*', ({ error }) => error(404, 'Not Found'));
app.listen(9000);

console.info(`${appTitle} v${appVersion} is running at https://${app.server?.hostname}:${app.server?.port}`);
