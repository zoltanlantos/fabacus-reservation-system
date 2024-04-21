import { jwtSecret } from '@/config';
import { jwt } from '@elysiajs/jwt';

export default () => {
  if (!jwtSecret) throw new Error('JWT secret is not defined');

  return jwt({ name: 'jwt', secret: jwtSecret });
};
