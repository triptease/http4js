import * as assert from 'assert';
import {deepStrictEqual, notStrictEqual} from 'assert';
import {Headers, HeaderValues, ReqOf} from '../../main';
import {Readable} from "stream";
import {strictEqual} from "node:assert";

describe('in mem request', () => {

    it('is immutable', () => {
        const request1 = ReqOf('GET', '/');
        const request2 = request1.withHeader('tom', 'tosh');

        notStrictEqual(request1, request2);
    });

    it('set method is case insensitive', () => {
        strictEqual(
            ReqOf('gEt', '/')
                .method,
            'GET')
    });

    it('set uri', () => {
        strictEqual(
            ReqOf('GET', '/')
                .withUri('/tom')
                .uri
                .path(),
            '/tom')
    });

    it('set plain body', () => {
        strictEqual(
            ReqOf('GET', '/')
                .withBody('body boy')
                .bodyString(),
            'body boy')
    });

    it('sets form field body on post', () => {
        deepStrictEqual(
            ReqOf('POST', '/')
                .withFormField('name', 'tosh')
                .bodyForm(),
            {name: 'tosh'}
        )
    });

    it('sets many form fields body on post', () => {
        const formRequest = ReqOf('POST', '/')
            .withFormField('name', 'tosh')
            .withFormField('age', '27');
        strictEqual(formRequest.bodyString(), 'name=tosh&age=27');
    });

    it('multiple same form fields lists all values', () => {
        const formRequest = ReqOf('POST', '/')
            .withFormField('name', 'tosh')
            .withFormField('name', 'bosh')
            .withFormField('name', 'losh');
        strictEqual(formRequest.bodyString(), 'name=tosh&name=bosh&name=losh');
    });

    it('merges many forms', () => {
        const formRequest = ReqOf('POST', '/')
            .withForm({name: 'tosh', age: '27'})
            .withForm({name: 'bosh', age: '31'});
        strictEqual(formRequest.bodyString(), 'name=tosh&name=bosh&age=27&age=31');
    });

    it('gives form field as list of strings', () => {
        const formRequest = ReqOf('POST', '/')
            .withFormField('name', ['tosh', 'bosh']);
        strictEqual(formRequest.bodyString(), 'name=tosh&name=bosh');
    });

    it('sets all form on post', () => {
        deepStrictEqual(
            ReqOf('POST', '/')
                .withForm({name: ['tosh', 'bosh'], age: '27'})
                .withHeader(Headers.CONTENT_TYPE, HeaderValues.FORM)
                .bodyForm(),
            {name: ['tosh', 'bosh'], age: '27'}
        )
    });

    it('sets form encoded header', () => {
        const req = ReqOf('POST', '/')
            .withForm({name: ['tosh', 'bosh'], age: '27'});
        const req2 = req
            .withFormField('name', 'tosh');
        strictEqual(
            req2
                .header(Headers.CONTENT_TYPE),
            HeaderValues.FORM
        )
    });

    it('overrides form encoded header if content type header already set', () => {
        strictEqual(
            ReqOf('POST', '/')
                .withHeader(Headers.CONTENT_TYPE, HeaderValues.MULTIPART_FORMDATA)
                .withForm({name: ['tosh', 'bosh'], age: '27'})
                .header(Headers.CONTENT_TYPE),
            HeaderValues.FORM
        )
    });

    it('set body string', () => {
        strictEqual(
            ReqOf('GET', '/')
                .withBody('tommy boy')
                .bodyString(),
            'tommy boy')
    });

    it('no body by default', () => {
        strictEqual(
            ReqOf('GET', '/').bodyString(),
            undefined)
    })

    it('body is handle on stream if given a stream', () => {
        const readable = new Readable({
            read() {
            }
        });
        readable.push('some body');
        readable.push(null);
        strictEqual(
            ReqOf('GET', '/')
                .withBody(readable)
                .bodyStream(),
            readable
        )
    });

    it('bodystring works as expected even if req body is a stream', () => {
        const readable = new Readable({
            read() {
            }
        });
        readable.push('some body');
        readable.push(null);
        const reqWithStreamBody = ReqOf('GET', '/').withBody(readable);
        strictEqual(reqWithStreamBody.bodyString(), 'some body');
        strictEqual(reqWithStreamBody.bodyString(), 'some body'); // read multiple times
    });

    it('sets query string', () => {
        strictEqual(
            ReqOf('GET', '/tom')
                .withQuery('tom', 'tosh')
                .withQuery('ben', 'bosh')
                .uri
                .queryString(),
            'tom=tosh&ben=bosh')
    });

    it('decodes query string parameters', () => {
        const req = ReqOf('GET', '/tom')
            .withQuery('tom', 'tosh%20eroo')
            .withQuery('ben', 'bosh%2Aeroo');

        strictEqual(req.query('tom'), 'tosh eroo');
        strictEqual(req.query('ben'), 'bosh*eroo');
    });


    it('sets query string using object of key-values', () => {
        strictEqual(
            ReqOf('GET', '/tom')
                .withQueries({tom: 'tosh', ben: 'bosh'})
                .uri
                .queryString(),
            'tom=tosh&ben=bosh')
    });

    it('sets query strings chained with url encoding', () => {
        strictEqual(
            ReqOf('GET', '/edoid')
                .withQuery('standard', 'standard')
                .withQuery('requiresEncoding', '=')
                .uri.queryString(),
            "standard=standard&requiresEncoding=%3D"
        )
    })

    it('sets multiple query strings at once with url encoding', () => {
        strictEqual(
            ReqOf('GET', '/edoid')
                .withQueries({
                    standard: 'standard',
                    requiresEncoding: '=',
                })
                .uri.queryString(),
            "standard=standard&requiresEncoding=%3D"
        )
    })

    it('does not re-encode URL encoded query parameters', () => {
        strictEqual(
            ReqOf('GET', '/edoid')
                .withQueries({
                    doesNotNeedReEncoding: encodeURI('='),
                })
                .uri.queryString(),
            "doesNotNeedReEncoding=%3D"
        )
    })

    it('extracts query params', async () => {
        const req = ReqOf('GET', '/test?tosh=rocks&bosh=pwns&losh=killer');

        deepStrictEqual(req.queries, {tosh: 'rocks', bosh: 'pwns', losh: 'killer'});
    });

    it('get header is case insensitive', () => {
        strictEqual(
            ReqOf('GET', 'some/url')
                .withHeader('TOM', 'rocks')
                .header('tom'),
            'rocks');
    });

    it('set header on request', () => {
        strictEqual(
            ReqOf('GET', 'some/url')
                .withHeader('tom', 'smells')
                .header('tom'),
            'smells');
    });

    it('concat same header on request', () => {
        assert.deepStrictEqual(
            ReqOf('GET', 'some/url')
                .withHeader('tom', 'smells')
                .withHeader('tom', 'smells more')
                .withHeader('tom', 'smells some more')
                .header('tom'),
            'smells, smells more, smells some more');
    });

    it('replace header', () => {
        strictEqual(
            ReqOf('GET', 'some/url')
                .withHeader('tom', 'smells')
                .replaceHeader('tom', 'is nice')
                .header('tom'),
            'is nice');
    });

    it('remove header', () => {
        strictEqual(
            ReqOf('GET', 'some/url')
                .withHeader('tom', 'smells')
                .removeHeader('tom')
                .header('tom'),
            undefined);
    });

    it('extracts path param', async () => {
        const req = ReqOf('GET', '/tom-param/test').withPathParamsFromTemplate('/{name}/test');

        strictEqual(req.pathParams.name, 'tom-param');
    });

    it('extracts multiple path params', async () => {
        const req = ReqOf('GET', '/tom/test/27/bob/180/fred')
            .withPathParamsFromTemplate('/{name}/test/{age}/bob/{height}/fred');

        strictEqual(req.pathParams.name, 'tom');
        strictEqual(req.pathParams.age, '27');
        strictEqual(req.pathParams.height, '180');
    });

    it('gives value malformed uri component if query is malformed', () => {
        strictEqual(
            ReqOf('GET', 'some/url?tosh=a%20b%20c%20%20^%20*%20%%20$%20%C2%A3')
                .query('tosh'),
            'Malformed URI component');
    });

});
