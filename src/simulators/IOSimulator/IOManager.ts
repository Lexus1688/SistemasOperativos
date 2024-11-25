import { 
	IOSimulator, 
	Request, 
	ProcessedRequest 
} from "./SimuladorES";
import { Manager } from "./../Manager";

import { Algorithm } from "./../Simulator";

class IOManager extends Manager<IOSimulator> { 
	// simulators for comparaison view
	private _selectedAlgorithms: string[];
	private _simulators: {[key: string]: IOSimulator};

	public onProcessedRequestChange: (algorithm: string, requests: ProcessedRequest[]) => void;

	constructor() {
		super();

		this.onProcessedRequestChange = () => {};

		// initializing simple view simulator
		this.simulator = new IOSimulator();
		this.simulator.onProcessedRequestsChange = (requests: ProcessedRequest[]) => {
			this.onProcessedRequestChange(this.simulator.algorithm, requests);
		};

		// initializing simulator for comparaison view
		this._selectedAlgorithms = [];
		this._simulators = {};
		IOSimulator.getAvailableAlgorithms().map((algorithm: Algorithm) => {
			this._simulators[algorithm.id] = new IOSimulator();
			this._simulators[algorithm.id].algorithm = algorithm.id;

			// set callbacks for Processed Requests
			this._simulators[algorithm.id].onProcessedRequestsChange = (requests: ProcessedRequest[]) => {
				this.onProcessedRequestChange(algorithm.id, requests);
			};
		});

		this._simpleView = true;
	}

	public addRequest(track: number) : void {
		// add the request to ALL simulators
		this.simulator.addRequest(track, 0);
		Object.values(this._simulators).map(simulator => {
			simulator.addRequest(track, 0);
		});
	}

	public removeRequest(index: number) : void {
		// remove request from ALL simulators
		this.simulator.removeRequest(index);
		Object.values(this._simulators).map(simulator => {
			simulator.removeRequest(index);
		});
	}

	set simpleView(enabled: boolean) {
		this._simpleView = enabled;

		// trigger callbacks
		if (this._simpleView) {
			this.simulator.triggerCallbacks();
		} else {
			Object.values(this._simulators).map(simulator => simulator.triggerCallbacks());
		}
	}

	set selectedAlgorithms(list: string[]) {
		if (this._simpleView) {
			this.simulator.algorithm = list[0];
		} else {
			this._selectedAlgorithms = list;
		}
	}

	public reset() : void {
		super.reset();
		Object.values(this._simulators).map(simulator => simulator.reset());
	}

	public clear() : void {
		super.clear();
		Object.values(this._simulators).map(simulator => simulator.clear());
	}

	// simulator setters
	set direction(value: boolean) {
		this.simulator.direction = value;
		Object.values(this._simulators).map(simulator => {
			simulator.direction = value;
		});
	}

	set tracks(value: number) {
		this.simulator.tracks = value;
		Object.values(this._simulators).map(simulator => {
			simulator.tracks = value;
		});
	}

	set initialPosition(value: number) {
		this.simulator.initialPosition = value;
		Object.values(this._simulators).map(simulator => {
			simulator.initialPosition = value;
		});
	}

	get simulators() : IOSimulator[] {
		return <IOSimulator[]>Object.entries(this._simulators).map(([key, value]) => {
			if (this._selectedAlgorithms.indexOf(key) >= 0) {
				return value;
			}
		}).filter((value) => value != undefined);
	}

	public calculateTotalDisplacement() : {[key: string]: number} {
		let values: {[key: string]: number} = {};

		if (this._simpleView) {
			values[this.simulator.getAlgorithm()] = this.simulator.calculateTotalDisplacement();
		} else {
			this._selectedAlgorithms.map(algorithm => {
				values[algorithm] = this._simulators[algorithm].calculateTotalDisplacement();
			});
		}

		return values;
	}
}

export default IOManager;