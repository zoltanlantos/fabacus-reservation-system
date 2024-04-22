import { cors } from '@elysiajs/cors';


/**
 * Cors plugin
 * 
 * This plugin enables CORS support for the application.
 * 
 * Design notes: This setup allows any origin to enable easier testing.
 * In a real-world scenario, this would be replaced with a proper CORS policy.
 */

export default () => cors();
