import { useEffect, useState } from "react";

interface StepAction {
	onReach?: ()=> void;
	onBeforeReach?: () => void;

	onFinish?: () => void;
}

const useTutorial = (simulator: string, maxSteps: number, forceShow: boolean, actions?: {[key: number]: StepAction}) => {
	const [visible, setVisible] = useState<boolean>(false);

	const [step, setStep] = useState<number>(0);

	useEffect(() => {
		let data = localStorage.getItem("tutorials");
		if (data == null) {
			setVisible(true);
		} else {
			let tutorials: string[] = JSON.parse(data);
			if (tutorials.indexOf(simulator) < 0 && forceShow) {
				setVisible(true);
			}
		}
	}, []);

	const close = () => {
		let data = localStorage.getItem("tutorials");
		if (data == null) {
			localStorage.setItem("tutorials", JSON.stringify([simulator]));
		} else {
			let tutorials: string[] = JSON.parse(data);
			tutorials.push(simulator);
			localStorage.setItem("tutorials", JSON.stringify(tutorials));
		}
		setStep(1);

		setVisible(false);
	};

	const show = () => {
		setVisible(true);
	};

	const nextStep = () => {
		if (step == (maxSteps - 1)) {
			return;
		}
		console.log("Next step");

		let previousStep: number = step;
		if (actions && (previousStep in actions)) {
			let fn = actions[previousStep].onFinish;
			if (fn != undefined) {
				fn();
			}
		}

		let nextStep: number = step + 1;
		if (actions && (nextStep in actions)) {
			let fn = actions[nextStep].onBeforeReach;
			if (fn != undefined) {
				fn();
			}
		}

		setStep(nextStep);
	};

	const prevStep = () => {
		if (step <= 0) return;

		let previousStep: number = step + 1;
		if (actions && (previousStep in actions)) {
			let fn = actions[previousStep].onFinish;
			if (fn != undefined) {
				fn();
			}
		}

		let nextStep: number = step - 1;
		if (actions && (nextStep in actions)) {
			let fn = actions[nextStep].onBeforeReach;
			if (fn != undefined) {
				fn();
			}
		}

		setStep(nextStep);
	};

	const onOpen = () => {
		setStep(0);
	};

	useEffect(() => {
		if (actions && (step in actions)) {
			let fn = actions[step].onReach;
			if (fn != undefined) {
				fn();
			}
		}
	}, [step]);

	const onStepChange = (step: number) => {
		setStep(step);
	};

	return {
		visible, step, prevStep, nextStep, onOpen,
		close, show, onStepChange
	};
};

export default useTutorial;
export type { StepAction };