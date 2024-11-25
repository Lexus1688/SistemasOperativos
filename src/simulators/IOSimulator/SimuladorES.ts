import { 
	Simulator, 
	Algorithm,
} from "../Simulator";

import State from "../State";
import IOState from "./IOState";

interface Request {
	peticiones: number;
	sector: number;
	fast?: boolean;
	requestIndex?: number;
};

interface ProcessedRequest {
	initialTrack: number;
	finalTrack: number;
	fast: boolean;
	index: number;
}

interface NextRequest {
	index: number;
	request: Request;
}

class SimuladorES extends Simulator {
	// hard drive settings
	private _tracks: number;
	public static MIN: number = 0;

	// simulation settings
	private currentTrack: number;
	private _initialPosition: number;
	private isUp: boolean;
	private running: boolean;

	// request list
	private requests: Request[];
	private pendingRequests: Request[];
	private proceesedRequests: ProcessedRequest[];

	// selected algorithm
	private _algorithm: string;

	// callbacks for state update
	protected states: IOState[];
	public onRequestsChange: (list: Request[]) => void;
	public onProcessedRequestsChange: (list: ProcessedRequest[]) => void;

	constructor(){
		super();

		this._tracks = 0;
		this.currentTrack = 0;
		this._initialPosition = 0;

		this.requests = [];
		this.pendingRequests = [];
		this.proceesedRequests = [];

		this._algorithm = "fifo";
		this.isUp = true;

		this.running = false;

		this.states = [];

		// initial callback values
		this.onRequestsChange = () => {};
		this.onProcessedRequestsChange = () => {};
	}

	/**
	 * Adds a request to the simulator
	 * Requests can only be added BEFORE starting the simulation
	 * @param track
	 * @param sector 
	 */
	public addRequest(track: number, sector: number) : void {
		let request: Request = {
			peticiones: track,
			sector
		};

		this.requests.push(request);
		this.pendingRequests.push(request);

		// request array has changed
		this.onRequestsChange(this.requests);
	}

	/**
	 * Removes a request from the list.
	 * Requests can only be removed BEFORE starting the simulation
	 * @param index request to be removed
	 */
	public removeRequest(index: number) : void {
		if (index >= this.requests.length) {
			// this request does not exist
			return;
		}
		this.requests.splice(index, 1);
		this.pendingRequests.splice(index, 1);

		this.onRequestsChange(this.requests);
	}

	private getNextRequest() : NextRequest {
		if(!this.running){

			this.running = true;
			this.currentTrack = this._initialPosition;

			// lock requests indexes
			this.pendingRequests.map((request: Request, index: number) => {
				request.requestIndex = index;
			});
		}

		let ALGORITHM_MAP: {[key: string]: () => number} = {
			"FIFO": this.FIFO.bind(this),
			"SSTF": this.SSTF.bind(this),
			"SCAN": this.SCAN.bind(this),
			"C-SCAN": this.CSCAN.bind(this),
			"LIFO": this.LIFO.bind(this)
		};

		let nextIndex = ALGORITHM_MAP[this._algorithm]();

		return {
			index: nextIndex,
			request: this.pendingRequests[nextIndex]
		};
	}

	public nextStep() : void {
		// save current state
		let currentState: IOState = new IOState(this.currentTrack, [...this.pendingRequests], [...this.proceesedRequests]);
		this.states.push(currentState);

		let nextRequest: NextRequest = this.getNextRequest();

		let processedRequest: ProcessedRequest = {
			initialTrack: this.currentTrack,
			finalTrack: nextRequest.request.peticiones,
			fast: nextRequest.request.fast || false,
			index: nextRequest.request.requestIndex || 0
		};

		this.currentTrack = processedRequest.finalTrack;

		// removing this request from the pending list
		this.pendingRequests.splice(nextRequest.index, 1);

		// add this request to the processed list
		this.proceesedRequests.push(processedRequest);
		this.onProcessedRequestsChange(this.proceesedRequests);
	}

	//FIFO
	private FIFO() : number {
		return 0;
	}
	//SSTF
	private SSTF() : number {
		let calculateDistance = (track: number) : number => Math.abs(track - this.currentTrack);

		// find the request that minimizes this distance
		let index: number = 0;
		let dist: number = calculateDistance(this.pendingRequests[index].peticiones);
		for (let i = 1; i < this.pendingRequests.length; i++) {
			let tmp = calculateDistance(this.pendingRequests[i].peticiones);
			if (tmp < dist) {
				index = i;
				dist = tmp;
			}
		}

		return index;
	}
	//SCAN	
	private SCAN(): number {
		let calculateDistance = (track: number): number => Math.abs(track - this.currentTrack);
		let index: number = -1;
		let dist: number = Infinity;
		let validRequests = this.pendingRequests.filter(req => 
			this.isUp ? req.peticiones >= this.currentTrack : req.peticiones <= this.currentTrack
		);
	
		for (let i = 0; i < validRequests.length; i++) {
			let tmp = calculateDistance(validRequests[i].peticiones);
			if (tmp < dist) {
				dist = tmp;
				index = this.pendingRequests.indexOf(validRequests[i]);
			}
		}
		if (index < 0) {
			this.isUp = !this.isUp;
			return this.SCAN(); 
		}
	
		return index;
	}	
	//CSCAN
	private CSCAN(): number {
		let calculateDistance = (track: number): number => Math.abs(track - this.currentTrack);
	
		let index: number = -1;
		let dist: number = Infinity;
	
		let validRequests = this.pendingRequests.filter(req => 
			this.isUp ? req.peticiones >= this.currentTrack : req.peticiones <= this.currentTrack
		);
	
		for (let i = 0; i < validRequests.length; i++) {
			let tmp = calculateDistance(validRequests[i].peticiones);
			if (tmp < dist) {
				dist = tmp;
				index = this.pendingRequests.indexOf(validRequests[i]);
			}
		}
	
		if (index < 0) {
			if (this.isUp) {
				let next = Math.min(...this.pendingRequests.map(req => req.peticiones));
				index = this.pendingRequests.findIndex(req => req.peticiones === next);
			} else {
				let next = Math.max(...this.pendingRequests.map(req => req.peticiones));
				index = this.pendingRequests.findIndex(req => req.peticiones === next);
			}
		}
	
		return index;
	}	
	// LIFO
	private LIFO(): number {
		if (this.pendingRequests.length === 0) {
			return -1;
		}

		return this.pendingRequests.length - 1;
	}

	private findNextRequest() : number {
		let index: number = -1;

		for (let i = 0; i < this.pendingRequests.length; i++) {
			if(this.isUp 
				&& this.pendingRequests[i].peticiones >= this.currentTrack 
				&& (index < 0 || index >= 0 && this.pendingRequests[i].peticiones < this.pendingRequests[index].peticiones)){
				index = i;
			}else if(!this.isUp 
				&& this.pendingRequests[i].peticiones <= this.currentTrack
				&& (index < 0 || index >= 0 && this.pendingRequests[i].peticiones > this.pendingRequests[index].peticiones)){
				index = i;
			}
		}

		return index;
	}

	/**
	 * Returns a list of available algorithms for this simulator
	 */
	public static getAvailableAlgorithms() : Algorithm[] {
		return [
			{ id: "FIFO", name: "First In First Out (FIFO)" },
			{ id: "SSTF", name: "Shortest Seek Time First (SSTF)" },
			{ id: "SCAN", name: "SCAN" },
			{ id: "C-SCAN", name: "C-SCAN" },
			{ id: "LIFO", name: "LIFO" },
		];
	}

	set algorithm(id: string) {
		this._algorithm = id;
	}

	set initialPosition(value: number) {
		this._initialPosition = value;
	}

	public reset() : void {
		this.pendingRequests = [...this.requests];

		this.currentTrack = this._initialPosition;

		this.proceesedRequests = [];
		this.onProcessedRequestsChange(this.proceesedRequests);

		this.states = [];

		this.running = false;
	}

	public clear() : void {
		this.requests = [];
		this.pendingRequests = [];
		this.proceesedRequests = [];
		this.states = [];
		this.running = false;

		this.onRequestsChange(this.requests);
		this.onProcessedRequestsChange(this.proceesedRequests);
	}

	public previousStep() : void {

		let state: IOState | undefined = this.states.pop();

		if(state !== undefined) {
			this.pendingRequests = state.pendingRequests;
			this.currentTrack = state.currentTrack;
			this.proceesedRequests = state.processedRequests;

			this.onProcessedRequestsChange(this.proceesedRequests);
		}
	}

	public triggerCallbacks() : void {
		this.onProcessedRequestsChange(this.proceesedRequests);
	}

	public hasNextStep() : boolean {
		return this.pendingRequests.length > 0;
	}

	public hasPreviousStep() : boolean {
		return this.states.length > 0;
	}

	get tracks() : number {
		return this._tracks;
	}

	set tracks(value: number) {
		this._tracks = value;
	}	

	set direction(up: boolean) {
		this.isUp = up;
	}

	private get maxTrack() : number {
		return this._tracks - 1 + SimuladorES.MIN;
	}

	get algorithm() : string {
		return this._algorithm;
	}

	public getAlgorithm() : string {
		return this._algorithm;
	}

	public calculateTotalDisplacement() : number {
		let sum: number = 0;

		let fakeSimulator: SimuladorES = new SimuladorES();
		fakeSimulator.algorithm = this._algorithm;
		fakeSimulator.tracks = this._tracks;
		fakeSimulator.initialPosition = this._initialPosition;

		this.requests.map(request => fakeSimulator.addRequest(request.peticiones, 0));

		let lastTrack: number = this._initialPosition;
		while (fakeSimulator.hasNextStep()) {
			fakeSimulator.nextStep();
			
			sum += Math.abs(fakeSimulator.currentTrack - lastTrack);
			lastTrack = fakeSimulator.currentTrack;
		}

		return sum;
	}
}

export {
	SimuladorES as IOSimulator
};

export type { 
	Request,
	ProcessedRequest
};