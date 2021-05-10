import { WebSocketServer } from "./WebSocketServer";
import { agent } from "./agent";

class Adapter extends WebSocketServer {
    private agentList: agent[] = [];

    start(port: number) {
        this.listen(port);
    }
}

export const adapter = new Adapter();