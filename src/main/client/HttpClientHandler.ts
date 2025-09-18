import {Handler} from "../core/HttpMessage.js";
import {Req} from "../core/Req.js";
import {Res} from "../core/Res.js";
import {HttpsClient} from "./HttpsClient.js";
import {HttpClient} from "./HttpClient.js";

export class HttpClientHandler implements Handler {
  public async handle(req: Req): Promise<Res> {
    return req.uri.protocol() === 'https'
      ? HttpsClient(req)
      : HttpClient(req);
  }
}