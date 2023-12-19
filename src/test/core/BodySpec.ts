import {Body} from '../../main/core/Body';
import {Readable} from 'stream';
import {strictEqual} from "node:assert";

function streamOf(body: string) {
  const readable = new Readable({read(){}});
  readable.push(body);
  readable.push(null);
  return readable;
}

describe('body', () => {
  it('bodyString body with string', () => {
    const body = Body.of('some body');
    strictEqual(body.bodyString(), 'some body');
  });

  it('bodyStream body with string', () => {
    const body = Body.of('some body');
    strictEqual(body.bodyStream().read().toString(), 'some body');
  });

  it('bodyString body with stream', () => {
    const body = Body.of(streamOf('some body'));
    strictEqual(body.bodyString(), 'some body');
  });

  it('bodyStream body with stream', () => {
    const body = Body.of(streamOf('some body'));
    strictEqual(body.bodyStream().read().toString(), 'some body');
  });
});