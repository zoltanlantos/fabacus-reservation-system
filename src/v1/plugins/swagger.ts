import { appTitle, appVersion } from '@/config';
import { swagger } from '@elysiajs/swagger';

export default () =>
  swagger({
    documentation: {
      info: {
        title: appTitle,
        version: appVersion,
      },
    },
  });
