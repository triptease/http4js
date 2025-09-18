import {asHandler, Client, Filters, get, Headers, HttpClient, HttpServer, Req, ReqOf, ResOf} from '../../main/index.js';
import {deepStrictEqual} from "assert";
import {Readable} from "stream";
import * as zlib from "zlib";
import {strictEqual} from "node:assert";

describe('client', () => {
  const server = get('/', async (req: Req) => ResOf(200, JSON.stringify(req.headers)))
    .withHandler("POST", "/gzip", async (req: Req) => ResOf(200, req.bodyStream()))
    .asServer(HttpServer(3045));

  const baseUrl = 'http://localhost:3045';

  before(() => {
    server.start()
  });

  after(() => {
    server.stop()
  });

  it('configure to add headers to every request it makes', async () => {
    const zipkinHeaders = {
      'x-b3-parentspanid': 'parentSpanId',
      'x-b3-traceid': 'traceId',
      'x-b3-spanid': 'spanId',
      'x-b3-sampled': '1',
      'x-b3-debug': 'true',
    };
    const zipkinClient = Client.withHeaders(zipkinHeaders);
    const res = await zipkinClient(ReqOf('GET', baseUrl));
    const requestHeaders = JSON.parse(res.bodyString());

    strictEqual(requestHeaders['x-b3-parentspanid'], zipkinHeaders['x-b3-parentspanid']);
    strictEqual(requestHeaders['x-b3-spanid'], zipkinHeaders['x-b3-spanid']);
    strictEqual(requestHeaders['x-b3-traceid'], zipkinHeaders['x-b3-traceid']);
    strictEqual(requestHeaders['x-b3-sampled'], zipkinHeaders['x-b3-sampled']);
    strictEqual(requestHeaders['x-b3-debug'], zipkinHeaders['x-b3-debug']);
  });

  it('ungzipped body', async () => {
    const inStream = new Readable({
      read() {
      }
    });
    inStream.push('ungzipped response');
    inStream.push(null); // No more data
    const gzippedBody = inStream.pipe(zlib.createGzip());
    const gzippedReq = ReqOf("POST", `${baseUrl}/gzip`).withBody(gzippedBody).withHeader(Headers.CONTENT_ENCODING, 'gzip');
    const response = await Filters.GZIP(asHandler(HttpClient)).handle(gzippedReq);

    deepStrictEqual(response.bodyString(), 'ungzipped response')
  });

});