import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SVG, PointArray, G, Circle as SVGCircle } from "@svgdotjs/svg.js"; 
import useInterval from "../../helpers/useInterval";

interface DiskProps {
	tracks: number;
	currentTrack: number;
	nextTrack: number | undefined;
	duration: number;
}

// colors
const TRACK_COLOR: string = "rgba(0, 0, 0, 0.2)";
const CURRENT_TRACK_COLOR: string = "black";
const NEXT_TRACK_COLOR: string = "purple";
const CENTER_COLOR: string = "black";
const HEADER_COLOR: string = "black";
const HEADER_CIRCLE_COLOR: string = "#fff";

// dimensions
const CENTER_RADIUS: number = 10; // center circle radius
const HEADER_RADIUS: number = 3; // header circle radius
const TRACK_WIDTH: number = 2; // track circle width

// original width, for scaling purposes
const WIDTH: number = 300;

// animations
const FPS: number = 30; // desired FPS

interface Circle {
	x: number;
	y: number;
	radius: number;
}
/**
 * Calculates the intersection between two circles
 * References: 
 * - https://math.stackexchange.com/questions/256100/how-can-i-find-the-points-at-which-two-circles-intersect
 * - https://stackoverflow.com/questions/8367512/how-do-i-detect-intersections-between-a-circle-and-any-other-circle-in-the-same
 * @param c1 Circle 1
 * @param c2 Circle 2
 */
const circleIntersection = (c1: Circle, c2: Circle) : number[][] => {
	let results: number[][] = [];

	// check if there is intersection between circles
	let R: number = Math.sqrt((c1.x - c2.x)**2 + (c1.y - c2.y)**2);

	if (Math.abs(c1.radius - c2.radius) <= R && R <= (c1.radius + c2.radius)) {
		// there is a solution
		let x: number = (c1.x + c2.x) + ((c1.radius**2 - c2.radius**2) / (R**2)) * (c2.x - c1.x);
		x *= 1/2; 

		let y: number = (c1.y + c2.y) + ((c1.radius**2 - c2.radius**2) / (R**2)) * (c2.y - c1.y);
		y *= 1/2;

		let tmp: number = 2 * ((c1.radius**2 + c2.radius**2) / (R**2)) - ((c1.radius**2 - c2.radius**2)**2 / (R**4)) - 1;
		tmp = Math.sqrt(tmp) / 2;

		let dX: number = tmp * (c2.y - c1.y);
		let dY: number = tmp * (c1.x - c2.x);

		results.push([x + dX, y + dY], [x - dX, y - dY]);
	}

	return results;
}

const getValidIntersection = (intersections: number[][], minX: number) => {
	let i;
	for (i = 0; i < intersections.length && intersections[i][0] < minX; i++);
	return intersections[i];
}

const rad2Deg = (radians: number) => radians * 180 / Math.PI;

interface GroupRef {
	g: G | null
};

function Disk(props: DiskProps) {
	const container = useRef<HTMLDivElement>(null);
	const chart = useRef(SVG());

	// helper functions
	const spaceBetweenTracks: number = (WIDTH / 2 - CENTER_RADIUS) / props.tracks;
	const trackRadius = (track: number) => WIDTH / 2 - track * spaceBetweenTracks;
	const getTrackColor = (track: number) : string => {
		if (track == props.currentTrack) {
			return CURRENT_TRACK_COLOR;
		} else if (track == props.nextTrack) {
			return NEXT_TRACK_COLOR;
		} else {
			return TRACK_COLOR;
		}
	};

	// angular velocity
	const w = useRef<number>(0);
	const angle = useRef<number>(0);
	const targetAngle = useRef<number>(0);

	// render
	const lastRender = useRef<number>(Date.now());

	// disk sections
	let disk = useRef<GroupRef>({ g: null });
	let headerGroup = useRef<G>(chart.current.group());
	const resetRotation = () => { 
		headerGroup.current.rotate(-angle.current, WIDTH / 2, WIDTH)
		angle.current = 0;
	};

	const tracks = useRef<SVGCircle[]>([]);

	const arePropsValid = () => {
		if (props.currentTrack == undefined || props.tracks == undefined 
			|| isNaN(props.tracks) || isNaN(props.currentTrack)) {
			return false;
		}

		if (props.tracks <= 0) {
			return false;
		}

		if (props.currentTrack > props.tracks || (props.nextTrack != undefined && props.nextTrack > props.tracks)) {
			return false;
		}

		return true;
	};

	useEffect(() => {
		if (arePropsValid()) {
			let headerCirlce: Circle = {
				x: WIDTH / 2,
				y: WIDTH,
				radius: WIDTH / 2
			};

			let currentTrackCircle: Circle = {
				x: WIDTH / 2,
				y: WIDTH / 2,
				radius: trackRadius(props.currentTrack)
			};

			let intersections: number[][] = circleIntersection(headerCirlce, currentTrackCircle);
			let intersection: number[] = getValidIntersection(intersections, WIDTH / 2);
			let initialAngle = rad2Deg(Math.atan((intersection[1] - WIDTH) / (intersection[0] - WIDTH / 2))) + 90;
			let currentAngle = initialAngle;
			if (headerGroup.current != null) {
				resetRotation();
				headerGroup.current.rotate(currentAngle, WIDTH / 2, WIDTH);
				angle.current = initialAngle;
			}

			if (props.nextTrack != undefined) {
				let targetTrackCircle: Circle = {
					x: WIDTH / 2,
					y: WIDTH / 2,
					radius: trackRadius(props.nextTrack)
				};

				intersections = circleIntersection(headerCirlce, targetTrackCircle);
				intersection = getValidIntersection(intersections, WIDTH / 2);
				initialAngle = rad2Deg(Math.atan((intersection[1] - WIDTH) / (intersection[0] - WIDTH / 2))) + 90;
				targetAngle.current = initialAngle;
			} else {
				targetAngle.current = currentAngle;
			}

			lastRender.current = Date.now();
			w.current = (currentAngle - targetAngle.current) / props.duration;

			tracks.current.map((track: SVGCircle, index: number) => {
				track.stroke({
					color: getTrackColor(index),
					width: TRACK_WIDTH
				});
			});
		}
	}, [props.nextTrack, props.currentTrack, props.tracks, props.duration]);

	useLayoutEffect(() => {
		if (container.current != null) {
			let width: number = container.current.getBoundingClientRect().width;
			let centerX: number = WIDTH / 2;
			let centerY: number = centerX;

			chart.current.addTo(container.current).size(width, width);

			disk.current.g = chart.current.group();

			let imageGroup = disk.current.g;
			let diskGroup = imageGroup.group();
			headerGroup.current = imageGroup.group();

			tracks.current = [];
			for (let i = 0; i < props.tracks; i++) {   
				let radius: number = trackRadius(i);

				let track = diskGroup.circle()
				.radius(radius)
				.move(centerX - radius, centerY - radius)
				.stroke({ color: getTrackColor(i), width: TRACK_WIDTH }).fill("transparent");

				tracks.current.push(track);
			}

			diskGroup.circle()
			.radius(CENTER_RADIUS)
			.move(centerX - CENTER_RADIUS, centerY - CENTER_RADIUS)
			.fill(CENTER_COLOR);

			let base: number = 50;

			let group = headerGroup.current;
			group.front();
			group.polygon([ [0, WIDTH / 2], [base / 2, 0], [base, WIDTH / 2] ])
			.fill(HEADER_COLOR)

			group.circle()
			.radius(HEADER_RADIUS)
			.fill(HEADER_CIRCLE_COLOR)
			.move(base / 2 - HEADER_RADIUS, -HEADER_RADIUS)
		
			group.move(WIDTH / 2 - base / 2, WIDTH / 2)
			group.rotate(angle.current, WIDTH / 2, WIDTH);

			let scale = (width - TRACK_WIDTH * 2) / WIDTH;
			imageGroup.scale(scale, scale, 0, 0).translate(TRACK_WIDTH, TRACK_WIDTH)
		}

		return () => {
			chart.current.clear();
			headerGroup.current = chart.current.group();
		};
	}, [props.tracks]);


	useEffect(() => {
		let resizeListener = () => {
			if (container.current != null && disk.current.g != null) {
				let availableWidth: number = container.current.getBoundingClientRect().width;

				let currentWidth = chart.current.width();
				let currentScale = currentWidth / WIDTH;

				let scale = ((availableWidth - TRACK_WIDTH * 2) / WIDTH) / currentScale;
				let group = disk.current.g;
				group.scale(scale, scale, 0, 0)
				chart.current.width(currentWidth * scale);
				chart.current.height(currentWidth * scale);
			}
		};

		window.addEventListener("resize", resizeListener);

		return () => {
			window.removeEventListener("resize", resizeListener);
		};
	}, [])

	useInterval(
		() => {
			let now: number = Date.now();
			let delta: number = now - lastRender.current;
			lastRender.current = now;

			if (w.current != 0) {
				let alpha: number = Math.abs(angle.current - targetAngle.current);
				if (alpha < Math.abs(w.current * delta)) {
					angle.current = targetAngle.current;
					headerGroup.current.rotate(alpha * (w.current > 0 ? 1 : -1), WIDTH / 2, WIDTH);
					w.current = 0;
				} else {
					angle.current = angle.current - w.current * delta;
					headerGroup.current.rotate(-w.current * delta, WIDTH / 2, WIDTH);
				}
			}
		},
		1000 / FPS,
		true
	);

	return (
		<div ref={container} id="disk_element"></div>
	)
}

export default Disk;