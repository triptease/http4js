import {Headers} from "../../main/index.js";
import {deepStrictEqual} from "assert";
import {strictEqual} from "node:assert";
import {describe, it} from 'vitest'

describe('headers', () => {

    it('gets a header', () => {
        const headers = Headers.of({name: 'tom'});
        strictEqual(headers.header('name'), 'tom');
    });

    it('undefined if not there', () => {
        const headers = Headers.of({});
        strictEqual(headers.header('name'), undefined);
    });

    it('adds a header', () => {
        const headers = Headers.of({name: 'tom'})
            .withHeader('age', '27');
        deepStrictEqual(headers.asObject(), { name: 'tom', age: '27' });
    });

    it('adds many headers', () => {
        const headers = Headers.of({name: 'tom'})
            .withHeaders({'age': '27', kiting: 'true'});
        deepStrictEqual(headers.asObject(), { name: 'tom', age: '27', kiting: 'true' });
    });

    it('replaces a header', () => {
        const headers = Headers.of({name: 'tom'})
            .replaceHeader('name', 'ben');
        deepStrictEqual(headers.asObject(), { name: 'ben' });
    });

    it('replaces all headers', () => {
        const headers = Headers.of({name: 'tom', age: '27'})
            .replaceAllHeaders({'name': 'ben'});
        deepStrictEqual(headers.asObject(), { name: 'ben' });
    });

    it('removes a header', () => {
        const headers = Headers.of({name: 'tom'})
            .removeHeader('name');
        deepStrictEqual(headers.asObject(), {});
    });

    it('accumulates headers of the same name', () => {
        const headers = Headers.of({name: 'tom'})
            .withHeaders({name: '27', kiting: 'true'});
        deepStrictEqual(headers.asObject(), { name: 'tom, 27', kiting: 'true' });
    });

});