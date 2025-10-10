import {deepStrictEqual, notStrictEqual} from "assert";
import {Uri} from "../../main/index.js";
import {strictEqual} from "node:assert";
import { describe, it} from 'vitest'

describe("uri", () => {

    it("encodes uris", () => {
        strictEqual(
            Uri.of("/tom/is the sugar/goodness").path(),
            "/tom/is%20the%20sugar/goodness");
    });

    it("extracts path params", () => {
        strictEqual(Uri.of("/tom/{is}/goodness")
                .extract("/tom/the sugar/goodness")
            .pathParam("is"),
            "the sugar")
    });

    it("handles encoded characters in path params", () => {
        let uri = Uri.of("/tom/{is}");
        const specialCharacters = [
         [':', '%3A'],
         ['/', '%2F'],
         ['#', '%23'],
         ['?', '%3F'],
         ['&', '%26'],
         ['@', '%40'],
         ['%', '%25'],
         ['+', '%2B'],
         [' ', '%20'],
        ];

        for (const [special, encoded] of specialCharacters) {
            strictEqual(uri.extract(`/tom/foo${encoded}`).pathParam('is'), `foo${special}`);
        }
    });

    it("matches paths", () => {
        strictEqual(Uri.of("/tom/is the sugar/goodness/gracious/me")
                .templateMatch("/tom/{is}/goodness"),
            true)
    });

    it("matches false when paths different", () => {
        strictEqual(Uri.of("/tom/{is}/goodness")
                .templateMatch("/tom/is/badness"),
            false)
    });

    it("parses out the path from uri string", () => {
        strictEqual(
            Uri.of("http://localhost:3000/").path(),
            "/");
        strictEqual(
            Uri.of("http://localhost:3000/tom/is the hot sauce/guy").path(),
            "/tom/is%20the%20hot%20sauce/guy");
    });

    it("parses out the protocol from uri string", () => {
        strictEqual(
            Uri.of("http://localhost:3000/").protocol(),
            "http");
    });

    it("parses out the query from uri string", () => {
        strictEqual(
            Uri.of("http://localhost:3000/?tom=foo&ben=bar").queryString(),
            "tom=foo&ben=bar");
    });

    it("parses out the hostname from uri string", () => {
        strictEqual(
            Uri.of("http://localhost:3000/?tom=foo&ben=bar").hostname(),
            "localhost");
    });

    it("parses out the port from uri string", () => {
        strictEqual(
            Uri.of("http://localhost:3000/?tom=foo&ben=bar").port(),
            "3000");
    });

    it("parses out the auth from uri string", () => {
        strictEqual(
            Uri.of("http://tom:tom1@localhost:3000/?tom=foo&ben=bar").auth(),
            "tom:tom1");
    });

    it("gives you a new Uri with new path", () => {
        const initial = Uri.of("http://localhost:3000/?tom=foo&ben=bar");
        const newPath = initial.withPath("/tosh");
        notStrictEqual(initial, newPath);
        strictEqual(newPath.asUriString(), "http://localhost:3000/tosh?tom=foo&ben=bar")
    });

    it("gives you a new Uri with new protocol", () => {
        const initial = Uri.of("http://localhost:3000/?tom=foo&ben=bar");
        const newPath = initial.withProtocol("https");
        notStrictEqual(initial, newPath);
        strictEqual(newPath.asUriString(), "https://localhost:3000/?tom=foo&ben=bar")
    });

    it("gives you a new Uri with new query", () => {
        const initial = Uri.of("http://localhost:3000/?tom=foo&ben=bar");
        const newPath = initial.withQuery("bosh", "NYC");
        notStrictEqual(initial, newPath);
        strictEqual(newPath.asUriString(), "http://localhost:3000/?tom=foo&ben=bar&bosh=NYC")
    });

    it('accumulates queries', () => {
        const initial = Uri.of("http://localhost:3000/?tom=foo&ben=bar");
        const newPath = initial.withQuery("ben", "NYC");
        strictEqual(newPath.asUriString(), "http://localhost:3000/?tom=foo&ben=bar&ben=NYC");
        deepStrictEqual(newPath.queryParams(), {tom: 'foo', ben: ['bar', 'NYC']});
    });

    it("gives you a new Uri with new hostname", () => {
        const initial = Uri.of("http://localhost:3000/?tom=foo&ben=bar");
        const newPath = initial.withHostname("focalhost");
        notStrictEqual(initial, newPath);
        strictEqual(newPath.asUriString(), "http://focalhost:3000/?tom=foo&ben=bar")
    });

    it("gives you a new Uri with new port", () => {
        const initial = Uri.of("http://localhost:3000/?tom=foo&ben=bar");
        const newPath = initial.withPort(3001);
        notStrictEqual(initial, newPath);
        strictEqual(newPath.asUriString(), "http://localhost:3001/?tom=foo&ben=bar")
    });

    it("gives you a new Uri with new auth", () => {
        const initial = Uri.of("http://localhost:3000/?tom=foo&ben=bar");
        const newPath = initial.withAuth("tom", "password");
        notStrictEqual(initial, newPath);
        strictEqual(newPath.asUriString(), "http://tom:password@localhost:3000/?tom=foo&ben=bar")
    });

});
