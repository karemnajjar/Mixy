import { readFileSync } from 'fs';
import { ServerOptions } from 'https';

export const sslConfig: ServerOptions = {
  key: readFileSync('path/to/private-key.pem'),
  cert: readFileSync('path/to/certificate.pem'),
  ca: readFileSync('path/to/ca-certificate.pem'),
}; 