import { FormEvent, useState, useRef, useEffect } from "react";
import { SaveFile } from "../Simulator";
import IOManager from "./IOManager";
import { IOSimulator, ProcessedRequest, Request } from "./SimuladorES";

const MAX_TRACKS: number = 200;

const DEFAULT_ALGORITHM: string = IOSimulator.getAvailableAlgorithms()[0].id;

const INITIAL_VALUE: {[key: string]: ProcessedRequest[]} = {}
IOSimulator.getAvailableAlgorithms().map(algorithm => {
	INITIAL_VALUE[algorithm.id] = [];
});

const useIOSimulator = () => {
	const manager = useRef(new IOManager());

	const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(DEFAULT_ALGORITHM);
	const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([DEFAULT_ALGORITHM]);

	const selectAlgorithm = (id: string) => {
		if (isSimpleView) {
			setSelectedAlgorithm(id);
			manager.current.selectedAlgorithms = [id];
		} else {
			if (selectedAlgorithms.indexOf(id) >= 0) {
				let tmp = [...selectedAlgorithms];
				tmp.splice(selectedAlgorithms.indexOf(id), 1);
				setSelectedAlgorithms(tmp);
			} else {
				setSelectedAlgorithms([...selectedAlgorithms, id]);
			}
		}
	};

	useEffect(() => {
		manager.current.selectedAlgorithms = selectedAlgorithms;
	}, [selectedAlgorithms]);

	const [errors, setErrors] = useState<{[key: string]: boolean}>({});
	const isFieldInvalid = (key: string) => (key in errors) && errors[key];

	const [initialPosition, setInitialPosition] = useState<number>(IOSimulator.MIN);
	useEffect(() => {
		setErrors({...errors, initialPosition: false});
		manager.current.initialPosition = isNaN(initialPosition) ? 100 : initialPosition;
	}, [initialPosition]);
	
	const [requestTrack, setRequestTrack] = useState<number>(NaN);
	const [maxTracks, setMaxTracks] = useState<number>(MAX_TRACKS);
	useEffect(() => {
		setErrors({...errors, maxTracks: false});
		manager.current.tracks = isNaN(maxTracks) ? 200 : maxTracks;
	}, [maxTracks]);

	const [direction, setDirection] = useState<boolean>(true);

	const [requests, setRequests] = useState<Request[]>([]);


	const addRequest = (track: number) => {
		manager.current.addRequest(track);
		setRequests((requests) => [...requests, { peticiones: track, sector: 0 }]);
	};

	const removeRequest = (index: number) => {
		let tmp = [...requests];
		tmp.splice(index, 1);
		setRequests(tmp);
		manager.current.removeRequest(index);
	};

	const loadRequestsFromList = (requests: number[]) => {
		if(isRunning) return;

		setRequests([]);
		manager.current.clear();
		
		requests.map((request: number) => addRequest(request));
	};

	const [isSimpleView, setSimpleView] = useState<boolean>(true);
	useEffect(() => {
		manager.current.simpleView = isSimpleView;

		if (isSimpleView) {
			manager.current.selectedAlgorithms = [selectedAlgorithm]
		} else {
			manager.current.selectedAlgorithms = selectedAlgorithms;
		}
		pause();
	}, [isSimpleView]);

	const onSubmitForm = (e: FormEvent) => {
		e.preventDefault();

		setRequestTrack(NaN);
		addRequest(requestTrack);
	};

	const [processedRequests, setProcessedRequests] = useState<{[key: string]: ProcessedRequest[]}>(INITIAL_VALUE);
	manager.current.onProcessedRequestChange = (algorithm: string, requests: ProcessedRequest[]) => {
		setProcessedRequests((processedRequests) => ({ ...processedRequests, [algorithm]: requests }));
	};

	const [isStarted, setStarted] = useState(false);
	const [isRunning, setRunning] = useState(false);
	const [speed, setSpeed] = useState(0);

	const step = () => {
		// check that everything is valid
		if (isNaN(initialPosition) || initialPosition >= maxTracks) {
			setErrors((errors) => ({...errors, initialPosition: true}));
			return;
		}

		if (isNaN(maxTracks)) {
			setErrors((errors) => ({...errors, maxTracks: true}));
			return;
		}

		if(!isStarted){
			manager.current.direction = direction;
			setStarted(true);
		}
		manager.current.nextStep();

		if (!manager.current.hasNextStep()) {
			setStarted(false);
			setRunning(false);
		}
	};

	const previous = () => {
		manager.current.previousStep();
	}

	const stop = () => {
		setStarted(false);
		setRunning(false);
		manager.current.reset();
	};

	const reset = () => {
		setRequests([]);
		setStarted(false);
		setRunning(false);
		manager.current.clear();
	};

	const pause = () => {
		setRunning(false);
	};

	const play = () => {
		setRunning(true);
	};

	const timerCallback = () => {
		if (!hasNext) {
			setRunning(false);
			return;
		}

		step();
	};

	const hasNext = () : boolean => {
		return manager.current.hasNextStep();
	}

	const hasPrevious = () : boolean => {
		return manager.current.hasPreviousStep();
	}

	useEffect(() => {
		setRunning(false);
		setStarted(false);
		manager.current.reset();
	}, [selectedAlgorithms, selectedAlgorithm, initialPosition, maxTracks, requests, direction]);

	const [maxDisplacement, setMaxDisplacement] = useState<{[key: string]: number}>({});
	useEffect(() => {
		setMaxDisplacement(manager.current.calculateTotalDisplacement());
	}, [selectedAlgorithms, selectedAlgorithm, initialPosition, maxTracks, requests, direction, isSimpleView]);

	const loadSimulation = (content: string) => {
		let data = JSON.parse(content);

		if (("type" in data) && data.type === "io") {
			if ("data" in data) {
				data = data.data;
				if (("initialTrack" in data)
					&& ("tracks" in data)
					&& ("direction" in data)
					&& ("requests" in data)
					&& ("algorithm" in data)
					&& ("algorithms" in data)
				) {

					setInitialPosition(data.initialTrack);
					setMaxTracks(data.tracks);
					setDirection(data.direction);
					setSelectedAlgorithm(data.algorithm);
					loadRequestsFromList(data.requests);
					setSelectedAlgorithms(data.algorithms);
				} else {
					throw new Error("invalid file format");
				}
			}
		}
	};

	return {
		selectedAlgorithm, setSelectedAlgorithm, selectedAlgorithms, selectAlgorithm,
		requests, removeRequest, loadRequestsFromList,
		initialPosition, setInitialPosition,
		requestTrack, setRequestTrack,
		maxTracks, setMaxTracks,
		direction, setDirection,
		onSubmitForm,
		processedRequests, maxDisplacement,
		isRunning, isStarted,
		step, reset, stop, previous, pause, play, timerCallback,
		hasNext, hasPrevious,
		isSimpleView, setSimpleView,
		speed, setSpeed,
		isFieldInvalid
	};
};

export default useIOSimulator;