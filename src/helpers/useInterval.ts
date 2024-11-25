import { useEffect } from "react";

const useInterval = (callback: Function, delta: number, enabled?: boolean) => {
	let run: boolean = enabled || false;

	useEffect(() => {
		if (run) {
			const interval = setInterval(callback, delta);
			return () => {
				clearInterval(interval);
			};
		}
	}, [callback, delta]);
};

export default useInterval;