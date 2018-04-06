### Table of Contents

- [Overview](/http4js)
- [Intro](/http4js/Intro)
- [In Memory Server](/http4js/In-memory)
- [Proxy](/http4js/Proxy)
- [Example App](https://github.com/TomShacham/http4js-eg)

# Proxy

Writing a proxy might look like this:

```typescript
const upstream = getTo("/", (req: Request) => {
    let response = new Response(200, req.headers);
    console.log("*** UPSTREAM RESPONSE ***");
    console.log(response);
    return Promise.resolve(response);
})
    .asServer(new NativeServer(3001))
    .start();

const proxy = getTo("/", (req: Request) => {
    let rewrittenRequest = req.setUri("http://localhost:3001/").setHeader("x-proxy", "header from proxy");
    console.log("*** REWRITTEN REQUEST ***");
    console.log(rewrittenRequest);
    return HttpClient(rewrittenRequest);
})
    .asServer()
    .start();

```

Now when we make a get request to `http://localhost:3000` we add our x-proxy header to it and rewrite the uri to `http://localhost:3001`.

```
*** REWRITTEN REQUEST ***
Request {
  headers:
   { host: 'localhost:3000',
     connection: 'keep-alive',
     'cache-control': 'max-age=0',
     'upgrade-insecure-requests': '1',
     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
     accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
     'accept-encoding': 'gzip, deflate, br',
     'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,pt;q=0.7',
     'x-proxy': 'header from proxy' },
  queries: {},
  form: {},
  method: 'GET',
  uri:
   Uri {
     matches: {},
     asNativeNodeRequest:
      Url {
        protocol: 'http:',
        slashes: true,
        auth: null,
        host: 'localhost:3001',
        port: '3001',
        hostname: 'localhost',
        hash: null,
        search: null,
        query: null,
        pathname: '/',
        path: '/',
        href: 'http://localhost:3001/' },
     template: '/',
     protocol: 'http:',
     auth: null,
     hostname: 'localhost',
     path: '/',
     port: '3001',
     query: null,
     href: 'http://localhost:3001/' },
  body: Body { bytes: <Buffer > },
  pathParams: {} }

*** UPSTREAM RESPONSE ***
Response {
  headers: {},
  body:
   { host: 'localhost:3000',
     connection: 'keep-alive',
     'cache-control': 'max-age=0',
     'upgrade-insecure-requests': '1',
     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
     accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
     'accept-encoding': 'gzip, deflate, br',
     'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,pt;q=0.7',
     'x-proxy': 'header from proxy' },
  status: 200 }

```