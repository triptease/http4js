import {asHandler, Method, Req, ReqOf, ResOf} from '../../main/index.js';
import {strictEqual} from "node:assert";

describe('HttpMessage', () => {
  it('converts httpHandler to handler interface', async () => {
    const expectedResponse = ResOf(200, 'some body');
    const handler = asHandler(async (_req: Req) => expectedResponse);
    strictEqual(await handler.handle(ReqOf(Method.GET, 'http://some.uri')), expectedResponse);
  });
});