import {Certs, NativeServer} from "./NativeServer.js";

export class NativeHttpsServer extends NativeServer {
    constructor(port: number, certs: Certs) {
        super(port, certs);
    }
}