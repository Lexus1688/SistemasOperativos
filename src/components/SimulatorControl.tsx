import React, { useEffect, useState, useRef, FormEvent, ChangeEvent } from "react";

import { GiNextButton, GiPreviousButton, GiOpenFolder, GiPauseButton } from "react-icons/gi";
import { BsFillStopFill, BsPlayFill, BsArrowCounterclockwise } from "react-icons/bs";
import { MdSave } from "react-icons/md";
import { IoIosHelpBuoy } from "react-icons/io";
import Tour, { ReactourStep } from 'reactour'
import useTutorial from "./../helpers/useTutorial";

import { 
	FormControl, 
	Modal,
	OverlayTrigger,
	Tooltip
} from "react-bootstrap";

import useInterval from "./../helpers/useInterval";
import { useTranslation } from "react-i18next";

interface SimulatorControlProps {
	hasPrevious?: boolean;
	hasNext?: boolean;
	running?: boolean;
	reset?: () => void;
	stop?: () => void;
	start?: () => void;
	pause?: () => void;
	next?: () => void;
	previous?: () => void;
	onSpeedChange?: (speed: number) => void;
	timerCallback?: () => void;
};

const MIN_SPEED: number = 100;
const MAX_SPEED: number = 3000;
const STEP_SPEED: number = 100;

function SimulatorControl(props: SimulatorControlProps) {
	const { t } = useTranslation();

	// speed slider control
	const [speed, setSpeed] = useState<number>(1000);
	useInterval(
		(props.timerCallback == undefined) ? (() => {}) : props.timerCallback, 
		speed,
		props.running
	);

	const onSpeedInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		let speed: number = parseInt(e.target.value);
		speed = MAX_SPEED - speed + MIN_SPEED;
		setSpeed(speed);
	};

	useEffect(() => {
		if (props.onSpeedChange != undefined) {
			let delay: number = speed;
			props.onSpeedChange(delay);
		}
	}, [speed])

	// tutorial steps
	const STEPS: ReactourStep[] = [
		{
			selector: '[data-tut="control_bar_overview"]',
			content: t("common.tutorial.control_bar_overview")
		},

		{
			selector: '[data-tut="control_bar_reset"]',
			content: t("common.tutorial.control_bar_reset")
		},

		{
			selector: '[data-tut="control_bar_stop"]',
			content: t("common.tutorial.control_bar_stop")
		},

		{
			selector: '[data-tut="control_bar_previous_step"]',
			content: t("common.tutorial.control_bar_previous_step")
		},

		{
			selector: '[data-tut="control_bar_next_step"]',
			content: t("common.tutorial.control_bar_next_step")
		},

		{
			selector: '[data-tut="control_bar_play"]',
			content: t("common.tutorial.control_bar_play")
		},

		{
			selector: '[data-tut="control_bar_speed"]',
			content: t("common.tutorial.control_bar_speed")
		},

		{
			selector: '[data-tut="storage"]',
			content: t("common.tutorial.storage")
		}
	];

	const Tutorial = useTutorial("control_bar", STEPS.length, false);
	
	return (
		<>
			<div 
				data-tut="control_bar_overview"
				className="control-bar">
				<div className="container">
					<OverlayTrigger
						overlay={<Tooltip id="reset_btn_tooltip">{t("common.buttons.reset")}</Tooltip>}>
						<button
							data-tut="control_bar_reset" 
							onClick={() => (props.reset == undefined) ? null : props.reset()}
							className="control-button">
							<BsArrowCounterclockwise />
						</button>
					</OverlayTrigger>

					<OverlayTrigger
						overlay={<Tooltip id="previous_step_btn_tooltip">{t("common.buttons.previous_step")}</Tooltip>}>
						<button 
							data-tut="control_bar_previous_step"
							onClick={() => (props.previous == undefined) ? null : props.previous()}
							disabled={!props.hasPrevious && true}
							className="control-button">
							<GiPreviousButton />
						</button>
					</OverlayTrigger>

					<OverlayTrigger
						overlay={<Tooltip id="previous_step_btn_tooltip">{t("common.buttons.stop")}</Tooltip>}>
						<button 
							data-tut="control_bar_stop"
							onClick={() => (props.stop == undefined) ? null : props.stop()}
							className="control-button">
							<BsFillStopFill />
						</button>
					</OverlayTrigger>

					{(props.running != undefined && props.running) ?
						<OverlayTrigger
							overlay={<Tooltip id="previous_step_btn_tooltip">{t("common.buttons.pause")}</Tooltip>}>
							<button 
								data-tut="control_bar_play"
								onClick={() => (props.pause == undefined) ? null : props.pause()}
								className="control-button">
								<GiPauseButton />
							</button>
						</OverlayTrigger>
						:
						<OverlayTrigger
							overlay={<Tooltip id="previous_step_btn_tooltip">{t("common.buttons.play")}</Tooltip>}>
								<button 
									data-tut="control_bar_play"
									disabled={!props.hasNext}
									onClick={() => (props.start == undefined) ? null : props.start()}
									className="control-button">
									<BsPlayFill />
								</button>
						</OverlayTrigger>
					}

					<OverlayTrigger
						overlay={<Tooltip id="previous_step_btn_tooltip">{t("common.buttons.next_step")}</Tooltip>}>
						<button 
							data-tut="control_bar_next_step"
							onClick={() => (props.next == undefined) ? null : props.next()}
							disabled={!props.hasNext && true}
							className="control-button">
							<GiNextButton />
						</button>
					</OverlayTrigger>

					<FormControl 
						data-tut="control_bar_speed"
						className="mt-sm-1"
						value={MAX_SPEED - speed + MIN_SPEED}
						step={STEP_SPEED}
						min={MIN_SPEED}
						max={MAX_SPEED}
						onChange={onSpeedInputChange}
						type="range"/>

					<div className="float-right">
						<OverlayTrigger
							overlay={<Tooltip id="previous_step_btn_tooltip">{t("common.buttons.tutorial")}</Tooltip>}>
							<button 
								onClick={Tutorial.show}
								className="control-button">
								<IoIosHelpBuoy />
							</button>
						</OverlayTrigger>
					</div>

					<div
						data-tut="storage" 
						className="float-right">

					</div>
				</div>
			</div>

			<Tour
				steps={STEPS}
				onAfterOpen={Tutorial.onOpen}
				goToStep={Tutorial.step}
				nextStep={Tutorial.nextStep}
				prevStep={Tutorial.prevStep}
				onRequestClose={Tutorial.close}
				isOpen={Tutorial.visible} />
		</>
	);
}

export default SimulatorControl;