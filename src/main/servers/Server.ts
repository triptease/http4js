import {Routing} from "../core/Routing.js";
import * as http from 'http';
import * as https from 'https';

export interface Http4jsServer {
    server: http.Server | https.Server;
    port: number;

    registerCatchAllHandler(routing: Routing): void
    start(): void
    stop(): Promise<any>
    isRunning(): Boolean;

}
