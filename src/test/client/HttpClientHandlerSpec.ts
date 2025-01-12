import * as fs from 'fs';
import {get, HttpServer, HttpsServer, ReqOf, Res} from '../../main';
import {HttpClientHandler} from '../../main/client/HttpClientHandler';
import {strictEqual} from "node:assert";

describe('HttpClientHandler', () => {
  const certs = {
    key: fs.readFileSync('src/ssl/key.pem'),
    cert: fs.readFileSync('src/ssl/fullchain.pem'),
    ca: fs.readFileSync('src/ssl/my-root-ca.cert.pem'),
  };

  const httpServer = get('/', async () => Res.OK('ok'))
    .asServer(HttpServer(3013));
  const httpsServer = get('/', async () => Res.OK('ok'))
    .asServer(HttpsServer(3014, certs));

  before(() => {
    require('ssl-root-cas')
      .inject()
      .addFile('src/ssl/my-root-ca.cert.pem');
    httpServer.start();
    httpsServer.start();
  });

  after(() => {
    httpServer.stop();
    httpsServer.stop();
  });

  it('should handle http requests', async () => {
    const response = await new HttpClientHandler().handle(ReqOf('GET', 'http://localhost:3013/'));
    strictEqual(response.bodyString(), 'ok');
  });

  it('should handle https requests', async () => {
    const response = await new HttpClientHandler().handle(ReqOf('GET', 'https://localhost:3014/'));
    strictEqual(response.bodyString(), 'ok');
  });
});