import {deepStrictEqual, notStrictEqual} from "assert";
import {Res, ResOf} from "../../main/index.js";
import {Readable} from "stream";
import {strictEqual} from "node:assert";
import { describe, it} from 'vitest'

describe("in mem response", () => {

    it("is immutable", () => {
        const response1 = new Res(200, "OK");
        const response2 = response1.withHeader("tom", "tosh");

        notStrictEqual(response1, response2);
    });

    it("set body", () => {
        strictEqual(
            new Res()
                .withBody("body boy")
                .bodyString(),
            "body boy")
    });

    it("set body string", () => {
        strictEqual(
            new Res()
                .withBody("body boy-o")
                .bodyString(),
            "body boy-o")
    });

    it('body is handle on stream if given a stream', () => {
        const readable = new Readable({read(){}});
        readable.push('some body');
        readable.push(null);
        strictEqual(
            ResOf(200)
                .withBody(readable)
                .bodyStream(),
            readable
        )
    });

    it('bodystring works as expected even if res body is a stream', () => {
        const readable = new Readable({read(){}});
        readable.push('some body');
        readable.push(null);
        const reqWithStreamBody = ResOf(200).withBody(readable);
        strictEqual(reqWithStreamBody.bodyString(), 'some body');
        strictEqual(reqWithStreamBody.bodyString(), 'some body'); // read multiple times
    });


    it("set header on response", () => {
        strictEqual(
            new Res()
                .withHeader("tom", "smells")
                .header("tom"),
            "smells");
    });

    it("concat same header on response", () => {
        deepStrictEqual(
            new Res()
                .withHeader("tom", "smells")
                .withHeader("tom", "smells more")
                .withHeader("tom", "smells some more")
                .header("tom"),
            "smells, smells more, smells some more");
    });

    it('replace header', () => {
        strictEqual(
            new Res()
                .withHeader("tom", "smells")
                .replaceHeader("tom", "is nice")
                .header("tom"),
            "is nice");
    });

    it('remove header', () => {
        strictEqual(
            new Res()
                .withHeader("tom", "smells")
                .removeHeader("tom")
                .header("tom"),
            undefined);
    });

    it("can set body with just a string or a Body" , () => {
        strictEqual(
            new Res(200, "some string made into a Body")
                .bodyString(),
            "some string made into a Body")
    });

    it("Redirect is sugar for Res withHeader Location", () => {
        strictEqual(Res.Redirect(302, "/tosh").header("Location"),
            "/tosh"
        )
    })

});