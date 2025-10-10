import * as fs from 'fs';
import {get, HttpsClient, HttpsServer, Method, Req, ReqOf, Res} from '../../main/index.js';
import {strictEqual} from "node:assert";
import {afterAll, beforeAll, describe, it} from 'vitest'

describe('httpsclient', () => {

  let lastPost: Req;
  let lastDelete: Req;

  const certs = {
    key: fs.readFileSync('src/ssl/key.pem'),
    cert: fs.readFileSync('src/ssl/fullchain.pem'),
    ca: fs.readFileSync('src/ssl/my-root-ca.cert.pem'),
  };

  const server = get('/', async () => Res.OK('ok'))
    .withDelete('/', async (req: Req) => {
      lastDelete = req;
      return Res.OK('ok')
    })
    .withPost('/', async (req: Req) => {
      lastPost = req;
      return Res.OK('ok')
    })
    .asServer(HttpsServer(3014, certs));

  beforeAll(async () => {
    // @ts-ignore
    const sslRootCas = await import('ssl-root-cas');
    sslRootCas.default
      .inject()
      .addFile('src/ssl/my-root-ca.cert.pem');
    server.start();
  });

  afterAll(() => {
    server.stop();
  });

  it('can make a request given ReqOptions', async () => {
    const response = await HttpsClient({method: 'GET', uri: 'https://localhost:3014/'});
    strictEqual(response.bodyString(), 'ok');
  });

  it('posts body content to server', async () => {
    lastPost = ReqOf(Method.GET, '/');
    const response = await HttpsClient({method: 'POST', uri: 'https://localhost:3014/', body: 'some body'});
    strictEqual(response.bodyString(), 'ok');
    strictEqual(lastPost.bodyString(), 'some body');
  });

  it('delete sends body content to server', async () => {
    lastDelete = ReqOf(Method.GET, '/');
    const response = await HttpsClient({method: 'DELETE', uri: 'https://localhost:3014/', body: 'some body'});
    strictEqual(response.bodyString(), 'ok');
    strictEqual(lastDelete.bodyString(), 'some body');
  });
});