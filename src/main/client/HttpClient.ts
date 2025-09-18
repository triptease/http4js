import * as http from "http";
import {IncomingMessage} from "http";
import {Res, ResOf} from "../core/Res.js";
import {Req, ReqOf} from "../core/Req.js";
import {Headers, HeaderValues} from "../core/Headers.js";
import {HeadersJson} from "../core/HttpMessage.js";
import {ReqOptions} from "./Client.js";
import {Readable} from "stream";

export function HttpClient(request: Req | ReqOptions): Promise<Res> {
    const req = request instanceof Req
        ? request
        : ReqOf(request.method, request.uri, request.body, request.headers);

    return wire(req)
}

function wire(req: Req): Promise<Res> {
    const options = req.uri.asNativeNodeRequest;

    const headers = req.bodyStream()
        ? {...req.headers, [Headers.TRANSFER_ENCODING]: HeaderValues.CHUNKED}
        : req.headers;

    const requestOptions = {
        ...options,
        headers,
        method: req.method,
    };

    return new Promise((resolve, reject) => {
        const clientRequest = http.request(requestOptions, (res: IncomingMessage) => {
            return resolve(ResOf(res.statusCode, res, res.headers as HeadersJson));
        });
        clientRequest.on('error', (err) => {
            reject(err);
        });
        if (req.bodyStream()){
            req.bodyStream()!.pipe(clientRequest);
        } else {
            const bodyStream = new Readable({ read() {} });
            bodyStream.push(req.bodyString());
            bodyStream.push(null); // No more data
            bodyStream.pipe(clientRequest);
        }
    });
}