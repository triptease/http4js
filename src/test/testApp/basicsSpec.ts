import {get, HttpClient, HttpServer, ReqOf, ResOf} from "../../main";
import {strictEqual} from "node:assert";

describe('requiring http4js from index export file', () => {
    const port = 4001;
    const server = get('/', async() => ResOf(200, 'ok'))
        .asServer(HttpServer(port));

    it('serve a route', async () => {
        const res = await get('/', async() => ResOf(200, 'ok')).serve(ReqOf('GET', '/'))
        strictEqual(res.bodyString(), 'ok')
    });

    it('serve a request over the wire', async () => {
        const res = await server.serveE2E(ReqOf('GET', '/'));
        strictEqual(res.bodyString(), 'ok')
    });

    it('make an http request', async () => {
        server.start();
        const res = await HttpClient(ReqOf('GET', `http://localhost:${port}/`));
        server.stop();
        strictEqual(res.bodyString(), 'ok')
    });
});
