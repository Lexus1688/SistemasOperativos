import State from "../State";
import { Request, ProcessedRequest } from "./SimuladorES";

class IOState extends State {
    // current header position
    private _currentTrack: number;

    // list of pending requests
    private _pendingRequests: Request[];
    private _processedRequests: ProcessedRequest[];


    constructor(track: number, requests: Request[], processedRequests: ProcessedRequest[]) {
        super();

        this._currentTrack = track;
        this._pendingRequests = requests;
        this._processedRequests = processedRequests;
    }

    get currentTrack() : number {
        return this._currentTrack;
    }

    get pendingRequests() : Request[] {
        return this._pendingRequests;
    }

    get processedRequests() : ProcessedRequest[] {
        return this._processedRequests;
    }
}

export default IOState;