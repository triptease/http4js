import {Uri} from "./Uri.js";
import {Headers, HeaderValues} from "./Headers.js";
import {
    BodyContent,
    FormField,
    FormJson,
    HeadersJson,
    HttpMessage,
    KeyValues,
    PathParams,
    Queries,
    QueryField
} from "./HttpMessage.js";
import {Body} from "./Body.js";
import {Readable} from "stream";
import {Form} from "./Form.js";

export class Req implements HttpMessage {

    uri: Uri;
    method: string;
    headers: HeadersJson;
    body: Body | undefined;
    queries: Queries = {};
    pathParams: KeyValues = {};

    constructor(method: string,
                uri: Uri | string,
                body: Body | BodyContent | undefined = undefined,
                headers: Headers | HeadersJson = {},
                pathParams: PathParams = {}
    ) {
        this.method = method.toUpperCase();
        if (typeof uri == "string") {
            const uriNoTrailingSlash = uri.endsWith('/') && uri !== "/" ? uri.slice(0, -1) : uri;
            this.uri = Uri.of(uriNoTrailingSlash);
        } else {
            this.uri = uri;
        }
        if (typeof body === 'string' || body instanceof Readable) {
            this.body = Body.of(body);
        } else if (body !== undefined) {
            this.body = body;
        }

        this.headers = headers instanceof Headers ? headers.asObject() : headers;
        this.queries = this.uri.queryParams();
        this.pathParams = pathParams;
        return this;
    }

    withUri(uri: Uri | string): Req {
        return new Req(this.method, uri, this.body, Headers.of(this.headers));
    }

    header(name: string): string {
        return Headers.of(this.headers).header(name);
    }

    withHeader(name: string, value: string): Req {
        return new Req(this.method, this.uri, this.body, Headers.of(this.headers).withHeader(name, value));
    }

    withHeaders(headers: HeadersJson): Req {
        return new Req(this.method, this.uri, this.body, Headers.of(this.headers).withHeaders(headers));
    }

    replaceHeader(name: string, value: string): Req {
        return new Req(this.method, this.uri, this.body, Headers.of(this.headers).replaceHeader(name, value));
    }

    replaceAllHeaders(headers: HeadersJson): Req {
        return new Req(this.method, this.uri, this.body, Headers.of(this.headers).replaceAllHeaders(headers));
    }

    removeHeader(name: string): Req {
        return new Req(this.method, this.uri, this.body, Headers.of(this.headers).removeHeader(name));
    }

    withBody(body: Body | BodyContent): Req {
        return new Req(this.method, this.uri, body, this.headers);
    }

    withFormField(name: string, value: FormField): Req {
        const newFormBodyString = Form.of(this.bodyForm()).withFormField(name, value).formBodyString();
        return ReqOf(this.method, this.uri, newFormBodyString, this.headers)
            .replaceHeader(Headers.CONTENT_TYPE, HeaderValues.FORM);
    }

    withForm(form: FormJson): Req {
        return ReqOf(this.method, this.uri, Form.of(this.bodyForm()).withForm(form).formBodyString(), this.headers)
            .replaceHeader(Headers.CONTENT_TYPE, HeaderValues.FORM);
    }

    formField(name: string): FormField | undefined {
        return Form.of(this.bodyForm()).field(name);
    }

    bodyString(): string | undefined {
        return this.body?.bodyString();
    }

    bodyStream(): Readable | undefined {
        return this.body?.bodyStream();
    }

    bodyForm(): FormJson {
        return Form.fromBodyString(this.bodyString() ?? '').asObject();
    }

    withPathParamsFromTemplate(template: string): Req {
        return new Req(this.method, this.uri, this.body, this.headers, Uri.of(template).extract(this.uri.path()).matches);
    }

    withQuery(name: string, value: string): Req {
        return new Req(this.method, this.uri.withQuery(name, value), this.body, this.headers);
    }

    withQueries(queries: KeyValues): Req {
        return new Req(this.method, this.uri.withQueries(queries), this.body, this.headers);
    }

    query(name: string): QueryField {
        return this.queries[name];
    }

}

export function ReqOf(method: string,
                      uri: Uri | string,
                      body: Body | BodyContent | undefined = undefined,
                      headers = {}): Req {
    return new Req(method, uri, body, headers);
}