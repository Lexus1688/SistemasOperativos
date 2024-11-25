import React, { useState, useEffect } from "react";

import RequestChart from "./RequestChart";
import Disk from "./Disk";
import SimulatorControl from "./../../components/SimulatorControl";
import { IOSimulator, ProcessedRequest, Request } from "./SimuladorES";
import useIOSimulator from "./useIOSimulator";
import useAlgorithmHelp from "../../components/AlgorithmModalHelp/useAlgorithmHelp";
import useTutorial, { StepAction } from "../../helpers/useTutorial";

import Tour, { ReactourStep } from 'reactour'
import { useTranslation } from "react-i18next";

import "./../../common/css/App.scss";

import { 
	Row, 
	Col,
	FormGroup,
	FormControl,
	FormCheck,
	Modal
} from "react-bootstrap";

import { 
	FiDelete,
	FiInfo
} from "react-icons/fi";

import {
	BsFillGridFill,
	BsFillSquareFill
} from "react-icons/bs";

import { IoIosHelpBuoy } from "react-icons/io";
import TopBar from "../../components/TopBar";

function IOSimulatorPage() {
	const { t } = useTranslation();

	const {
		requests, loadRequestsFromList,
		initialPosition, setInitialPosition,
		requestTrack, setRequestTrack,
		maxTracks, setMaxTracks,
		direction, setDirection,
		removeRequest,
		onSubmitForm,
		selectedAlgorithm, setSelectedAlgorithm, selectAlgorithm, selectedAlgorithms,
		processedRequests, maxDisplacement,
		isRunning, isStarted,
		step, reset, stop, previous, play, pause, timerCallback,
		hasNext, hasPrevious,
		isSimpleView, setSimpleView,
		speed, setSpeed,
		isFieldInvalid
	} = useIOSimulator();

	// modal help texts
	const {
		showAlgorithmModal,
		AlgorithmModal
	} = useAlgorithmHelp("io");

	// tutorial
	const STEPS: ReactourStep[] = [
		{
			selector: '[data-tut="view_bar"]',
			content: t("common.tutorial.view_bar")
		},

		{
			selector: '[data-tut="algorithm_select"]',
			content: t("io.tutorial.algorithm_select")
		},

		{
			selector: '[data-tut="simulator_settings"]',
			content: t("io.tutorial.simulator_settings")
		},

		{
			selector: '[data-tut="request_list"]',
			content: t("io.tutorial.request_list")
		},

		{
			selector: '[data-tut="request_list_add"]',
			content: t("io.tutorial.request_list_add", { min: IOSimulator.MIN, max: (IOSimulator.MIN + maxTracks - 1) })
		},

		{
			selector: '[data-tut="request_list_remove"]',
			content: t("io.tutorial.request_list_remove")
		},

		{
			selector: '[data-tut="demo_requests"]',
			content: t("io.tutorial.demo_requests")
		},

		{
			selector: '[data-tut="repeat_tutorial"]',
			content: t("common.tutorial.repeat_tutorial")
		}
	];

	const STEP_ACTIONS: {[key: number]: StepAction} = {
		5: {

			onFinish: () => {
				loadRequestsFromList([]);
			}
		}
	};

	const Tutorial = useTutorial("io", STEPS.length, true, STEP_ACTIONS);

	const chartRequests = (algorithm: string) : number[] => {
		let requests: number[] = [initialPosition];

		for (let i = 0; i < processedRequests[algorithm].length; i++) {
			requests.push(processedRequests[algorithm][i].finalTrack);
		}

		return requests;
	};

	// calculate sum of displacement
	const calculateSumDisplacement = (algorithm: string) : number => {
		let sum = 0;
		processedRequests[algorithm].map(request => {
			sum += Math.abs(request.finalTrack - request.initialTrack);
		});
		return sum;
	};

	
	let aux = (request: Request) => request.peticiones;

	// get last processed requests of selected algorithm
	const getLastProcessedRequest = () => {
		if (processedRequests[selectedAlgorithm].length > 0) {
			return processedRequests[selectedAlgorithm][processedRequests[selectedAlgorithm].length - 1];
		}

		return null;
	}

	let lastProcessedRequest = getLastProcessedRequest();
	
	function getBestAlgorithmMessage() {
		const algorithmAverages = selectedAlgorithms.map((algorithm) => {
		  const totalDisplacement = calculateSumDisplacement(algorithm);
		  const averageDisplacement = totalDisplacement / processedRequests[algorithm].length;
		  return { algorithm, averageDisplacement };
		});
	  
		const minAverage = Math.min(...algorithmAverages.map(a => a.averageDisplacement));
	  
		const bestAlgorithms = algorithmAverages
		  .filter(a => a.averageDisplacement === minAverage)
		  .map(a => `${a.algorithm} (${a.averageDisplacement.toFixed(2)})`);
	  
		return bestAlgorithms.join(", ");
	  }
  
	return (
		<>
			{/* Tutorial and view select bar */}
			<TopBar
				simpleView={isSimpleView} 
				onChangeView={setSimpleView}
				onClickTutorial={Tutorial.show} />

			{/* Simulator settings and requests */}
			<Row>
				<Col md={6}>
					<div className="simulator-group">
						<div className="simulator-group-content">
							<div className="title">{t("common.simulator_settings")}</div>

							<Row>
								<Col 
									data-tut="algorithm_select"
									md={8} 
									className="mb-3">
									<FormGroup>
										<label>{t("common.simulation_algorithm")}</label>
										
										{IOSimulator.getAvailableAlgorithms().map(algorithm =>
											<FormCheck 
												name="selectedAlgorithm"
												type={isSimpleView ? "radio" : "checkbox"}
												disabled={isStarted}
												onChange={() => selectAlgorithm(algorithm.id)}
												checked={(isSimpleView && (selectedAlgorithm == algorithm.id)) 
													|| (!isSimpleView && (selectedAlgorithms.indexOf(algorithm.id) >= 0))}
												value={algorithm.id}
												label={
													<>
														{algorithm.name}
														<button 
															onClick={() => showAlgorithmModal(algorithm.id)}
															className="btn btn-icon btn-sm">
															<FiInfo />
														</button>
													</>
												} />
										)}
									</FormGroup>
								</Col>
							
								<Col md={4}
									data-tut="simulator_settings">
									<FormGroup>
										<label>{t("io.initial_position")}</label>
										<FormControl 
											value={initialPosition}
											min={IOSimulator.MIN}
											max={maxTracks + IOSimulator.MIN - 1}
											disabled={isStarted}
											onChange={(e) => setInitialPosition(parseInt(e.target.value))}
											isInvalid={isFieldInvalid("initialPosition")}
											type="number" />
									</FormGroup>

									<FormGroup>
										<label>{t("io.track_number")}</label>
										<FormControl 
											value={maxTracks}
											disabled={isStarted}
											min={1} 
											max={1000}
											onChange={(e) => { 
												if (parseInt(e.target.value) <= 1000) {
													setMaxTracks(parseInt(e.target.value));
												}
											}}
											isInvalid={isFieldInvalid("maxTracks")}
											type="number" />
									</FormGroup>

									{(["scan", "cscan"].indexOf(selectedAlgorithm) >= 0
										|| selectedAlgorithms.filter((id) => ["SCAN", "C-SCAN"].includes(id)).length > 0) 
										&&
										<FormGroup>
											<label>Sentido</label>
											<FormCheck 
												type="radio"
												label="Ascendente"
												onChange={() => setDirection(true)}
												checked={direction}
												disabled={isStarted}
												name="direction" />

											<FormCheck 
												type="radio"
												label="Descendente"
												onChange={() => setDirection(false)}
												checked={!direction}
												disabled={isStarted}
												name="direction" />
										</FormGroup>
									}
								</Col>
							</Row>
						</div>
					</div>
				</Col>

				<Col md={6}>
					<div className="simulator-group mt-3 mt-sm-0">
						<div 
							data-tut="request_list"
							className="simulator-group-content">
							<div className="title">{t("io.requests")}</div>

							<Row>
								<Col 
									data-tut="request_list_add"
									md={6}>
									<form onSubmit={onSubmitForm}>
										<FormGroup>
											<label>{t("io.track")}</label>

											<FormControl
												required
												min={IOSimulator.MIN}
												max={IOSimulator.MIN + maxTracks - 1}
												disabled={isStarted}
												value={requestTrack}
												onChange={(e) => setRequestTrack(parseInt(e.target.value))}
												type="number" />
										</FormGroup>

										<button 
											disabled={isStarted}
											id="add_request_btn"
											className="btn btn-primary mt-2 float-right">
											{t("io.add_request")}
										</button>
									</form>
								</Col>
								
								<Col 
									data-tut="request_list_remove"
									md={6}>
									{requests.length == 0 ?
										<p>{t("io.no_requests_added")}</p>
										:
										requests.map((value: Request, index: number) => {
											// check if this request is already processed or not
											let background: string = "bg-secondary";
											if (isSimpleView) {
												let found: boolean = false;
												for (let i = 0; i < processedRequests[selectedAlgorithm].length && !found; i++) {
													found = processedRequests[selectedAlgorithm][i].index == index;
												}

												if (found) {
													background = "bg-success";
												}
											} else {
												let completed = true;
												let atLeastOne = false;

												selectedAlgorithms.map(algorithm => {
													let found: boolean = false;
													for (let i = 0; i < processedRequests[algorithm].length && !found; i++) {
														found = processedRequests[algorithm][i].index == index;
													}

													atLeastOne = atLeastOne || found;
													completed = completed && found;
												});

												if (!completed && atLeastOne) {
													background = "bg-warning";
												} else if (completed) {
													background = "bg-success";
												}
											}

											return (
												<span className={`badge rounded-pill pill-md ${background} px-2 mr-1`}>
													{value.peticiones}

													{!isStarted &&	
														<FiDelete
															onClick={() => removeRequest(index)}
															className="pointer ml-sm-1" />
													}
												</span>
											);
										})
									}
								</Col>
							</Row>
						</div>

						<div 
							data-tut="demo_requests"
							className="simulator-group-footer">
							<div className="title">{t("common.examples")}</div>
						</div>
					</div>
				</Col>
			</Row>

			{/* Results */}
			{isSimpleView &&
			<Row className="mt-2">
				<h2>{t("io.results")}</h2>

				<Col md={6}>
					<Row>
						<Col md={8}>
							<RequestChart 
								tracks={3}
								id="simple_chart"
								maxTrack={Math.max(...(requests.map(aux)), initialPosition, maxTracks)}
								totalDisplacement={selectedAlgorithm in maxDisplacement ? maxDisplacement[selectedAlgorithm] : 1}
								requests={chartRequests(selectedAlgorithm)} />
						</Col>
					
						<Col md={4}>
							<Disk 
								tracks={maxTracks}
								nextTrack={lastProcessedRequest ? lastProcessedRequest.finalTrack : undefined}
								currentTrack={lastProcessedRequest ? lastProcessedRequest.initialTrack : initialPosition}
								duration={speed}
								/>
						</Col>
					</Row>
				</Col>

				<Col md={6}>
					<div className="table-responsive">
						<table className="table">
							<thead>
								<tr>
									<th>{t("io.request_number")}</th>
									<th>{t("io.initial_position")}</th>
									<th>{t("io.final_position")}</th>
									<th>{t("io.displacement")}</th>
								</tr>
							</thead>

							<tbody>
								{processedRequests[selectedAlgorithm].map((request, index) => 
									<tr>
										<td>{index + 1}</td>
										<td>{request.initialTrack}</td>
										<td>{request.finalTrack}</td>
										<td>
											{Math.abs(request.finalTrack - request.initialTrack)}
											{request.fast && <sup>*</sup>}
										</td>
									</tr>
								)}

								{processedRequests[selectedAlgorithm].length == 0 ?
									<tr>
										<td colSpan={4}>{t("io.no_requests_completed")}</td>
									</tr>
									:
									<>
										<tr>
											<td></td>
											<td></td>
											<td>{t("io.total")}</td>
											<td>
												{calculateSumDisplacement(selectedAlgorithm)}
											</td>
										</tr>

										<tr>
										<td></td>
										<td></td>
										<td>{t("io.average")}</td>
										<td>
											{["C-SCAN", "SCAN", "SSTF", "LIFO", "FIFO"].includes(selectedAlgorithm) ?
												(maxDisplacement[selectedAlgorithm] == calculateSumDisplacement(selectedAlgorithm) ? 
													(maxDisplacement[selectedAlgorithm] / processedRequests[selectedAlgorithm].length).toFixed(2) 
													: "-"
												)
												: "-"}
										</td>
										</tr>
									</>
								}
								
							</tbody>
						</table>
					</div>
				</Col>
			</Row>
			}

			{!isSimpleView &&
			<Row className="mt-2 mb-2">
				<h2>{t("io.results")}</h2>
				
				<div className="row scrollable-x">
					{selectedAlgorithms.map((algorithm: string, index: number) => 
						<Col md={8} lg={5} xl={4}>
							<h4 className="mt-0">{t("ALGORITMO " + algorithm)}</h4>

							<Row>
								<Col md={12}>
									{/* Request chart */}
									<RequestChart 
										tracks={3}
										id={"chart_" + algorithm}
										maxTrack={Math.max(...(requests.map(aux)), initialPosition, maxTracks)}
										totalDisplacement={maxDisplacement[algorithm] || 0}
										requests={chartRequests(algorithm)} />
								</Col>
							</Row>

							<Row>
								<Col md={6}>
									<table className="table">
										<thead>
											<tr>
												<th>{t("io.request_number")}</th>
												<th>{t("io.initial_position")}</th>
												<th>{t("io.final_position")}</th>
												<th>{t("io.displacement")}</th>
											</tr>
										</thead>

										<tbody>
											{processedRequests[algorithm].map((request, index) => 
												<tr key={index}>
													<td>{index + 1}</td>
													<td>{request.initialTrack}</td>
													<td>{request.finalTrack}</td>
													<td>
														{Math.abs(request.finalTrack - request.initialTrack)}
														{request.fast && <sup>*</sup>}
													</td>
												</tr>
											)}

											{processedRequests[algorithm].length == 0 ?
												<tr>
													<td colSpan={4}>{t("io.no_requests_completed")}</td>
												</tr>
												:
												<>
													<tr>
														<td></td>
														<td></td>
														<td>{t("io.total")}</td>
														<td>
															{calculateSumDisplacement(algorithm)}
														</td>
													</tr>

													<tr>
														<td></td>
														<td></td>
														<td>{t("io.average")}</td>
														<td>
														{["C-SCAN", "SCAN", "SSTF", "LIFO", "FIFO"].includes(algorithm) ? (
															maxDisplacement[algorithm] === calculateSumDisplacement(algorithm)
															? (maxDisplacement[algorithm] / processedRequests[algorithm].length).toFixed(2)
															: "-"
														) : (
															"-"
														)}
														</td>
													</tr>
												</>
											}
										</tbody>
									</table>
								</Col>
							</Row>
						</Col>
					)}
				</div>
				 {/* Display best algorithm message */}
    			<Row className="mt-3">
      				<Col>
        				<h6>
          					{t("El algoritmo más eficiente para este caso es ")}:{" "}
         					{getBestAlgorithmMessage()}
        </h6>
      </Col>
    </Row>
			</Row>
			}
			
			

			<SimulatorControl 
				running={isRunning}
				hasNext={hasNext()}
				hasPrevious={hasPrevious()}
				reset={reset}
				stop={stop}
				previous={previous}
				start={play}
				pause={pause}
				timerCallback={timerCallback}
				next={step}
				onSpeedChange={setSpeed} />

			<AlgorithmModal
				onOpen={pause} />

			<Tour
				steps={STEPS}
				onAfterOpen={Tutorial.onOpen}
				goToStep={Tutorial.step}
				getCurrentStep={Tutorial.onStepChange}
				nextStep={Tutorial.nextStep}
				prevStep={Tutorial.prevStep}
				onRequestClose={Tutorial.close}
				isOpen={Tutorial.visible} />
		</>
	)
}

export default IOSimulatorPage;