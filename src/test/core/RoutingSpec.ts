import {deepStrictEqual, equal} from "assert";
import {getTo, postTo, routes} from "../../main/core/Routing";
import {Response} from "../../main/core/Response";
import {Body} from "../../main/core/Body";
import {Request} from "../../main/core/Request";
import {HttpHandler} from "../../main/core/HttpMessage";

describe('a basic in memory server', () => {

    it("takes request and gives response", function () {
        return getTo("/test", (req: Request) => {
            return Promise.resolve(new Response(200, req.body));
        })
            .match(new Request("GET", "/test", new Body("Got it.")))
            .then(response => equal(response.body.bodyString(), "Got it."))
    });

    it("nests handlers", () => {
        return getTo("/test", () => {
            return Promise.resolve(new Response(200));
        })
            .withHandler("/nest", "GET", () => {
                return Promise.resolve(new Response(200, new Body("nested")));
            })
            .match(new Request("GET", "/test/nest"))
            .then(response => equal(response.body.bodyString(), "nested"))
    });

    it("add a filter", () => {
        return getTo("/test", () => {
            return Promise.resolve(new Response(200));
        })
            .withFilter(() => {
                return () => {
                    return Promise.resolve(new Response(200, new Body("filtered")));
                }
            })
            .match(new Request("GET", "/test"))
            .then(response => equal(response.body.bodyString(), "filtered"))
    });

    it("chains filters", () => {
        return getTo("/test", () => {
            return Promise.resolve(new Response(200));
        })
            .withFilter(() => {
                return () => {
                    return Promise.resolve(new Response(200, new Body("filtered")))
                }
            })
            .withFilter((handler: HttpHandler) => {
                return (req: Request) => {
                    return Promise.resolve(handler(req).then(response => response.setHeader("another", "filter")))
                }
            })
            .match(new Request("GET", "/test"))
            .then(response => {
                equal(response.body.bodyString(), "filtered");
                equal(response.getHeader("another"), "filter");
            })
    });

    it("chains filters and handlers", () => {
        return getTo("/test", () => {
            return Promise.resolve(new Response(200));
        })
            .withHandler("/nest", "GET", () => {
                return Promise.resolve(new Response(200, new Body("nested")));
            })
            .withFilter((handler: HttpHandler) => {
                return (req: Request) => {
                    return handler(req).then(response => response.setHeader("a", "filter1"));
                }
            })
            .withFilter((handler: HttpHandler) => {
                return (req: Request) => {
                    return handler(req).then(response => response.setHeader("another", "filter2"));
                }
            })
            .match(new Request("GET", "/test/nest"))
            .then(response => {
                equal(response.body.bodyString(), "nested");
                equal(response.getHeader("a"), "filter1");
                equal(response.getHeader("another"), "filter2");
            })
    });

    it("recursively defining routes", () => {
        const nested = getTo("/nested", () => {
            return Promise.resolve(new Response(200).setBody("hi there deeply."));
        });
        return getTo("/", () => {
            return Promise.resolve(new Response(200));
        })
            .withRoutes(nested)
            .match(new Request("GET", "/nested"))
            .then(response => equal(response.bodyString(), "hi there deeply."))

    });

    it("matches path params only if specified a capture in route", () => {
        return getTo("/family", () => {
            return Promise.resolve(new Response(200, new Body("losh,bosh,tosh")));
        })
            .match(new Request("GET", "/family/123"))
            .then(response => equal(response.bodyString(), "GET to /family/123 did not match routes"))
    });

    it("extracts path param", () => {
        return getTo("/{name}/test", (req) => {
            return Promise.resolve(new Response(200, new Body(req.pathParams["name"])));
        })
            .match(new Request("GET", "/tom/test"))
            .then(response => equal(response.bodyString(), "tom"));
    });

    it("extracts multiple path params", () => {
        return getTo("/{name}/test/{age}/bob/{personality}/fred", (req) => {
            return new Promise(resolve => resolve(
                new Response(200, new Body(`${req.pathParams["name"]}, ${req.pathParams["age"]}, ${req.pathParams["personality"]}`))
            ))
        })
            .match(new Request("GET", "/tom/test/26/bob/odd/fred"))
            .then(response => {
                const pathParams = response.bodyString().split(", ");
                equal(pathParams[0], "tom");
                equal(pathParams[1], "26");
                equal(pathParams[2], "odd");
            })
    });

    it("extracts query params", () => {
        return getTo("/test", (req) => {
            const queries = [
                req.getQuery("tosh"),
                req.getQuery("bosh"),
                req.getQuery("losh"),
            ];
            return Promise.resolve(new Response(200, new Body(queries.join("|"))));
        })
            .match(new Request("GET", "/test?tosh=rocks&bosh=pwns&losh=killer"))
            .then(response => equal(response.bodyString(), "rocks|pwns|killer"));
    });

    it("unknown route returns a 404", () => {
        return getTo("/", () => {
            return Promise.resolve(new Response(200, new Body("hello, world!")));
        })
            .match(new Request("GET", "/unknown"))
            .then(response => equal(response.status, 404));
    });

    it("custom 404s using filters", () => {
        return getTo("/", () => {
            return Promise.resolve(new Response(200, new Body("hello, world!")));
        })
            .withFilter((handler: HttpHandler) => {
                return (req: Request) => {
                    const responsePromise = handler(req);
                    return responsePromise.then(response => {
                        if (response.status == 404) {
                            return new Promise<Response>(resolve => resolve(new Response(404, new Body("Page not found"))));
                        } else {
                            return new Promise<Response>(resolve => resolve(response));
                        }
                    });
                }
            })
            .match(new Request("GET", "/unknown"))
            .then(response => {
                equal(response.status, 404);
                equal(response.bodyString(), "Page not found");
            });
    });

    it("ordering - filters apply in order they are declared", () => {
        return getTo("/", () => {
            return Promise.resolve(new Response(200, new Body("hello, world!")));
        }).withFilter((handler) => (req) => {
            return handler(req).then(response => response.replaceHeader("person", "tosh"));
        }).withFilter((handler) => (req) => {
            return handler(req).then(response => response.replaceHeader("person", "bosh"));
        })
            .match(new Request("GET", "/"))
            .then(response => equal(response.getHeader("person"), "bosh"))
    });

    it("can add stuff to request using filters", () => {
        return getTo("/", (req) => {
            return Promise.resolve(new Response(200, new Body(req.getHeader("pre-filter") || "hello, world!")));
        }).withFilter((handler) => (req) => {
            return handler(req.setHeader("pre-filter", "hello from pre-filter"))
        })
            .match(new Request("GET", "/"))
            .then(response => equal(response.bodyString(), "hello from pre-filter"))
    });

    it("exact match handler", () => {
        return getTo("/", () => {
            return Promise.resolve(new Response(200, new Body("root")));
        }).withHandler("/family", "GET", () => {
            return Promise.resolve(new Response(200, new Body("exact")));
        }).withHandler("/family/{name}", "GET", () => {
            return Promise.resolve(new Response(200, new Body("fuzzy")));
        }).withHandler("/family", "POST", () => {
            return Promise.resolve(new Response(200, new Body("post")));
        })
            .match(new Request("GET", "/family"))
            .then(response => equal(response.bodyString(), "exact"))
    });

    it("Post redirect.", () => {
        const friends = [];
        const routes = getTo("/", () => {
            return Promise.resolve(new Response(200, new Body("root")));
        })
            .withHandler("/family", "GET", () => {
                return Promise.resolve(new Response(200, new Body(friends.join(", "))));
            })
            .withHandler("/family/{name}", "GET", () => {
                return Promise.resolve(new Response(200, new Body("fuzzy")));
            })
            .withHandler("/family", "POST", (req) => {
                friends.push(req.form["name"]);
                return Promise.resolve(new Response(302).setHeader("Location", "/family"));
            });

        const postSideEffect1 = routes.match(new Request("POST", "/family", new Body("name=tosh")));
        const postSideEffect2 = routes.match(new Request("POST", "/family", new Body("name=bosh")));
        const postSideEffect3 = routes.match(new Request("POST", "/family", new Body("name=losh")));

        return routes.match(new Request("GET", "/family"))
            .then(response => equal(response.bodyString(), "tosh, bosh, losh"))


    });

    it("extract form params", () => {
        return postTo("/family", (req) => {
            return Promise.resolve(new Response(200, new Body(req.form)));
        })
            .match(new Request("POST", "/family", new Body("p1=1&p2=tom&p3=bosh&p4=losh")).setHeader("Content-Type", "application/x-www-form-urlencoded"))
            .then(response => {
                deepStrictEqual(response.body.bytes, {p1: "1", p2: "tom", p3: "bosh", p4: "losh"})
            })
    });

    it("matches method by regex", () => {
        return routes(".*", "/", () => Promise.resolve(new Response(200, "matched")) )
            .match(new Request("GET", "/"))
            .then(response => {
                equal(response.bodyString(), "matched");
            })
    });

    it("matches path by regex", () => {
        return routes(".*", ".*", () => Promise.resolve(new Response(200, "matched")) )
            .match(new Request("GET", "/any/path/matches"))
            .then(response => {
                equal(response.bodyString(), "matched");
            })
    });

});
