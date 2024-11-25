import State from "./State";

interface Algoritmo {
	id: string;
	name: string;
}

abstract class Simulador {
	constructor() {
		
	}

	public abstract nextStep() : void;
	public abstract hasNextStep() : boolean;

	public abstract previousStep() : void;
	public abstract hasPreviousStep() : boolean;

	/**
	 * Sets the simulator to its initial state
	 */
	public abstract reset() : void;

	/**
	 * Sets the simulator to an empty state, without any request
	 */
	public abstract clear() : void;
};

interface SaveFile {
	type: "io" | "cpu" | "allocation" | "pagination";
	data: any;
};

export { 
	Simulador as Simulator
};

export type {
	Algoritmo as Algorithm, SaveFile
};