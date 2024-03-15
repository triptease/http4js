import * as https from "https";
import {Headers, HeadersJson, HeaderValues, Req, ReqOf, Res, ResOf} from '../';
import {Readable} from "stream";
import {ReqOptions} from "./Client";

export async function HttpsClient(request: Req | ReqOptions): Promise<Res> {
    const req = request instanceof Req
        ? request
        : ReqOf(request.method, request.uri, request.body, request.headers);

    const options = req.uri.asNativeNodeRequest;

    const headers = req.bodyStream()
        ? {...req.headers, [Headers.TRANSFER_ENCODING]: HeaderValues.CHUNKED}
        : req.headers;

    const reqOptions = {
        ...options,
        headers,
        method: req.method,
    };

    // type system needs a hand
    return new Promise(resolve => {
        let clientRequest = https.request(reqOptions, (res) => {
            const inStream = new Readable({
                read() {
                }
            });
            res.on('error', (err: any) => {
                console.error(err);
            }).on('data', (chunk: Buffer) => {
                inStream.push(chunk);
            }).on('end', () => {
                inStream.push(null); // No more data
                return resolve(ResOf(res.statusCode, inStream, res.headers as HeadersJson));
            });
        });
        const body = req.bodyString();
        if (body !== undefined) {
            clientRequest.write(body);
        }
        clientRequest.end();
    });
}