import { swagger } from '@elysiajs/swagger';
import { appTitle, appVersion } from '../../config';

export default () => swagger({
  documentation: {
    info: {
      title: appTitle,
      version: appVersion,
    },
  },
});
