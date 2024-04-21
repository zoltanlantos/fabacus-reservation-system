import { jwt } from '@elysiajs/jwt';

export default () =>
  jwt({
    name: 'jwt',
    // todo: replace with a real secret from env variables
    secret: 'Mollit aliqua mollit non aute.',
  });
