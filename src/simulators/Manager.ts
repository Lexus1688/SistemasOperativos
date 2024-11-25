import { Simulator } from "./Simulator";

abstract class Manager<SimulatorType extends Simulator> {
	// simulators
	protected simulator!: SimulatorType;

	// indicates if the simulator is in simple or comparaison view
	protected _simpleView: boolean;

	constructor() {
		this._simpleView = true;
	}

	public nextStep() : void {
		if (this._simpleView) {
			this.simulator.nextStep();
		} else {
			this.simulators.map(simulator => {
				if (simulator.hasNextStep()) {
					simulator.nextStep();
				}
			});
		}
	}

	public hasNextStep() : boolean {
		if (this._simpleView) {
			return this.simulator.hasNextStep();
		} else {
			let available: boolean = false;
			
			for (let i = 0; i < this.simulators.length && !available; i++) {
				available = this.simulators[i].hasNextStep();
			}

			return available;
		}
	}

	public previousStep() : void {
		if (this._simpleView) {
			this.simulator.previousStep();
		} else {
			this.simulators.map(simulator => {
				if (simulator.hasPreviousStep()) {
					simulator.previousStep();
				}
			});
		}
	}

	public hasPreviousStep() : boolean {
		if (this._simpleView) {
			return this.simulator.hasPreviousStep();
		} else {
			let available: boolean = false;
			
			for (let i = 0; i < this.simulators.length && !available; i++) {
				available = this.simulators[i].hasPreviousStep();
			}

			return available;
		}
	}
	
	public clear() : void {
		this.simulator.clear();
		this.simulators.map(simulator => simulator.clear());
	}

	public reset() : void {
		this.simulator.reset();
		this.simulators.map(simulator => simulator.reset());
	}

	abstract get simulators() : SimulatorType[];


	public set simpleView(value: boolean) {
		this._simpleView = value;
	}

	public get simpleView() {
		return this._simpleView;
	}
}

export { Manager }