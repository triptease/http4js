import {Res} from "./Res";
import {Req} from "./Req";
import {Body} from "./Body";
import {Readable} from "stream";

export type KeyValues = {[key:string]: string};
export type PathParams = {[key:string]: string}
export type QueryField = string|string[];
export type Queries = {[key:string]: QueryField};
export type FormField = string|string[];
export type FormJson = {[key:string]: FormField};
export type HeadersJson = {[key:string]: string};
export type BodyContent = Readable | string;


export interface HttpMessage {
    headers: HeadersJson;
    body: Body | undefined;

    header(name: string): string;
    withHeader(name: string, value: string): HttpMessage;
    replaceHeader(name: string, value: string): HttpMessage
    replaceAllHeaders(headers: HeadersJson): HttpMessage
    removeHeader(name: string): HttpMessage
    withBody(body: string): HttpMessage
    bodyString(): string | undefined

}

export type HttpHandler = (request: Req) => Promise<Res>

export interface Handler {
    handle(req: Req): Promise<Res>;
}

export function asHandler(handler: HttpHandler | Handler): Handler {
  return (typeof handler) === 'function' ? new class implements Handler {
    handle(req: Req): Promise<Res> {
      return (handler as HttpHandler)(req);
    }
  } : handler as Handler;
}