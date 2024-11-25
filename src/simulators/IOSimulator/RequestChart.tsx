import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SVG, PointArray } from "@svgdotjs/svg.js";
import { useTranslation } from "react-i18next";

interface RequestChartProps {
	tracks?: number;
	maxTrack?: number;
	numberOfRequests?: number;
	totalDisplacement: number;
	requests: number[];
	id: string;
}

// chart settings
const WIDTH: number = 300;
const HEIGHT: number = 150;
const AXIS_WIDTH: number = 5;
const LINE_COLOR: string = "black";
const RADIUS: number = 6;
const TEXT_SIZE: number = 8;

function RequestChart(props: RequestChartProps) {
	const { t } = useTranslation();

	const container = useRef<HTMLDivElement>(null);
	const chart = useRef(SVG());

	const [status, setStatus] = useState<boolean>(false);
	const forceRender = () => setStatus((status) => !status);

	useLayoutEffect(() => {
		if(container.current != null){
			let myWidth = container.current.getBoundingClientRect().width;
			let myHeight = myWidth / 2;
			chart.current.addTo(container.current).size(myWidth, myHeight)
		}
	}, []);

	useEffect(() => {
		let WIDTH = chart.current.node.getBoundingClientRect().width;
		let HEIGHT = WIDTH / 2;

		let aux = chart.current;
		aux.clear();

		// highest request track
		let highestTrack: number = props.maxTrack == undefined ?
			Math.max(...props.requests) : props.maxTrack;

		let numberOfRequests = (props.numberOfRequests == undefined ? props.requests.length : props.numberOfRequests);
		const y = (request: number) : number => ((HEIGHT - 5 * AXIS_WIDTH - TEXT_SIZE) / highestTrack) * request;

		// y axis
		// calculate maximum text width
		let digits: number = Math.ceil(Math.log10(highestTrack));
		let textWidth: number = (digits + 1) * TEXT_SIZE;

		const x = (time: number) : number => (((WIDTH - textWidth - AXIS_WIDTH - 10) * time) / props.totalDisplacement) + textWidth;

		aux.rect(AXIS_WIDTH, HEIGHT - AXIS_WIDTH - TEXT_SIZE)
		   .move(textWidth, 0)
		   .fill({ color: LINE_COLOR });

		
		// y-axis numbers
		let positions: number[] = [];
		for (let i = 0; i < props.requests.length; i++) {
			// avoid text overlapping
			let text_y: number =  y(props.requests[i]);
			let found: boolean = false;
			let j: number = 0;
			while (!found && j < positions.length) {
				found = Math.abs(positions[j] - text_y) <= TEXT_SIZE;
				j++;
			}

			if(!found){
				let tmp: string = props.requests[i].toString();
				let a = aux.text(tmp)
			   		.font({ fill: LINE_COLOR, size: TEXT_SIZE })
				a.move(textWidth - a.length() - AXIS_WIDTH, text_y);

				positions.push(text_y);
			}

			// drawing axis line
			aux.rect(1 * AXIS_WIDTH, AXIS_WIDTH / 2)
			   .move(textWidth - AXIS_WIDTH / 2, y(props.requests[i]) + TEXT_SIZE / 2)
			   .fill({ color: LINE_COLOR });
		}

		// x axis
		aux.rect(WIDTH, AXIS_WIDTH)
		   .move(textWidth, HEIGHT - AXIS_WIDTH * 2 - TEXT_SIZE)
		   .fill({ color: LINE_COLOR });

		let sumDisplacements = (n: number) => {
			let sum: number = 0;
			for (let i = 1; i < props.requests.length && i <= n; i++) {
				sum += Math.abs(props.requests[i] - props.requests[i - 1]);
			}
			return sum;
		};

		let txt = aux.text(t("io.time"))
		   .font({ size: TEXT_SIZE });	
		txt.move(WIDTH - txt.length(), HEIGHT - TEXT_SIZE - AXIS_WIDTH);

		if (numberOfRequests > 1) {
			for (let i = 0; i < props.requests.length; i++) {			
				// line between requests
				if (i > 0) {
					let arrow = new PointArray([[0, 0], [2, 0], [1, 2]]);

					let line = aux.line(
						x(sumDisplacements(i - 1)) + RADIUS / 4, y(props.requests[i - 1]) + RADIUS / 2,
						x(sumDisplacements(i)) + RADIUS / 4, y(props.requests[i]) + RADIUS / 2
					).stroke({ width: 1, color: LINE_COLOR })
					
					// arrow
					line.marker("end", 30, 30, (add) => { 
						add.polygon(arrow)
						.fill({ color: LINE_COLOR })
						.rotate(-90, 1, 1)
						.scale(2)
						.translate(13 - RADIUS / 2, 15 - 1)
					});
				}

				// requests
				aux.circle(RADIUS)
				.move(x(sumDisplacements(i)), y(props.requests[i]))
				.translate(AXIS_WIDTH / 2 - RADIUS / 2, 0)
				.fill({ color: LINE_COLOR });			
			}
		}

		return () => {
			aux.clear();
		};
	});

	useEffect(() => {
		let resizeListener = () => {
			if (container.current != null) {
				// get available width
				let availableWidth: number = container.current.getBoundingClientRect().width;
				chart.current.width(availableWidth);
				chart.current.height(availableWidth / 2);
				forceRender();
			}
 		};

		// add resize listener on component init
		window.addEventListener("resize", resizeListener);

		return () => {
			// remove resize listener before component unload
			window.removeEventListener("resize", resizeListener);
		};
	}, []);

	return (
		<div ref={container} id={props.id}></div>
	);
}

export default RequestChart;