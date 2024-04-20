import pkg from '../package.json';

export const appTitle = pkg.name
  .split('-')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

export const appDescription = pkg.description;

export const appVersion = pkg.version;
