import {get, HttpClient, HttpServer, Method, Req, ReqOf, Res} from '../../main/index.js';
import {strictEqual} from "node:assert";
import {afterAll, beforeAll, describe, it} from 'vitest'

describe('httpclient', () => {
  let lastPost: Req;
  let lastDelete: Req;

  const server = get('/', async () => Res.OK('ok'))
    .withDelete('/', async (req: Req) => {
      lastDelete = req;
      return Res.OK('ok')
    })
    .withPost('/', async (req: Req) => {
      lastPost = req;
      return Res.OK('ok')
    })
    .asServer(HttpServer(3013));

  beforeAll(() => {
    server.start();
  });

  afterAll(() => {
    server.stop();
  });

  it('can make a request given ReqOptions', async () => {
    const response = await HttpClient({method: 'GET', uri: 'http://localhost:3013/'});
    strictEqual(response.bodyString(), 'ok');
  });

  it('posts body content to server', async () => {
    lastPost = ReqOf(Method.GET, '/');
    const response = await HttpClient({method: 'POST', uri: 'http://localhost:3013/', body: 'some body'});
    strictEqual(response.bodyString(), 'ok');
    strictEqual(lastPost.bodyString(), 'some body');
  });

  it('delete sends body content to server', async () => {
    lastDelete = ReqOf(Method.GET, '/');
    const response = await HttpClient({method: 'DELETE', uri: 'http://localhost:3013/', body: 'some body'});
    strictEqual(response.bodyString(), 'ok');
    strictEqual(lastDelete.bodyString(), 'some body');
  });
});