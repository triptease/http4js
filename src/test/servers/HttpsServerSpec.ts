import * as fs from "fs";
import {get, HttpsClient, HttpsServer, ReqOf, ResOf} from "../../main/index.js";
import {strictEqual} from "node:assert";
import {afterAll, beforeAll, describe, it} from 'vitest'

describe('https server', () => {

    const certs = {
        key: fs.readFileSync('src/ssl/key.pem'),
        cert: fs.readFileSync('src/ssl/fullchain.pem'),
        ca: fs.readFileSync('src/ssl/my-root-ca.cert.pem'),
    };

    let internalServer = HttpsServer(8000, certs);
    const routing = get('/', async() => ResOf(200, 'hello, world!'))
        .withPost('/', async() => ResOf(200, 'hello, world!'))
        .asServer(internalServer);

    beforeAll(async () => {
      // @ts-ignore
        const sslRootCas = await import('ssl-root-cas');
        sslRootCas.default
            .inject()
            .addFile('src/ssl/my-root-ca.cert.pem');
        routing.start();
    });

    it('serves a get request', async() => {
        const response = await HttpsClient(ReqOf('GET', 'https://localhost:8000/'));
        strictEqual(response.status, 200);
        strictEqual(response.bodyString(), 'hello, world!');
    });

    it('serves a post request', async() => {
        const response = await HttpsClient(ReqOf('POST', 'https://localhost:8000/', "I'm a body!"));
        strictEqual(response.status, 200);
        strictEqual(response.bodyString(), 'hello, world!');
    });

    it('should wait for server to stop', async () => {
        const runningBefore = internalServer.isRunning();
        strictEqual(runningBefore, true);

        await routing.stop();

        const runningAfter = internalServer.isRunning();
        strictEqual(runningAfter, false);
    });
});