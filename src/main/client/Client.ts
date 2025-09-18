import {BodyContent, Handler, HeadersJson, HttpHandler} from '../core/HttpMessage.js';
import {Req} from "../core/Req.js";
import {HttpClient} from "./HttpClient.js";
import {ZipkinHeaders} from "../zipkin/Zipkin.js";
import {Headers} from "../core/Headers.js";
import {Body} from "../core/Body.js";
import {Uri} from "../core/Uri.js";
import {asHandler, Filters} from '../index.js';


export interface ReqOptions {
    method: string;
    uri: Uri | string;
    body?: Body | BodyContent;
    headers?: Headers | HeadersJson;
}

export class Client {

    static withHeaders(headers: HeadersJson): HttpHandler {
        return (req: Req) => HttpClient(req.withHeaders(headers));
    }

    static zipkinClientFrom(incomingReq: Req): HttpHandler {
        return (req: Req) => HttpClient(
            req.replaceHeader(ZipkinHeaders.PARENT_ID, incomingReq.header(ZipkinHeaders.SPAN_ID))
                .replaceHeader(ZipkinHeaders.TRACE_ID, incomingReq.header(ZipkinHeaders.TRACE_ID))
        );
    }

    static gzip(): Handler {
        return Filters.GZIP(asHandler(HttpClient))
    }
}