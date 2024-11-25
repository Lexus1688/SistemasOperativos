import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import { 
	HashRouter as Router,
	Route, 
	Switch,
	useHistory
} from "react-router-dom"; 

import { FiCpu, FiHardDrive } from "react-icons/fi";
import { FaMemory } from "react-icons/fa";
import { IoIosHelpBuoy } from "react-icons/io";

import "./common/css/App.scss";

import IOSimulatorPage from "./simulators/IOSimulator/IOSimulatorPage";

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { useTranslation, initReactI18next } from "react-i18next";

import es from "./locales/es.json";

i18n.use(initReactI18next)
	.use(LanguageDetector)
	.init({
		resources: {
			es: { translation: es },
    	},
    	fallbackLng: "es",
		interpolation: {
      		escapeValue: false
    	},
	});

function App() {
	const { t } = useTranslation();
	const history = useHistory();

	const HomeOptions = [
		{ title: t("menu.IOSimulator"), icon: <FiHardDrive />, url: "/simuladorpd" },
	];

	return (
		<>
			<div className="container">
				<Switch>
					<Route path="/simuladorpd" exact={true}>
						<IOSimulatorPage />
					</Route>

					<Route>
						<div className="row d-flex justify-content-center">
							<div className="col-md-6 ">
								
								<div className="row">
									{HomeOptions.map(option => 
										<div className="col-md-6 mb-2 col-sm-6 pointer" onClick={() => history.push(option.url)}>
											<div className="card">
												<div className="card-body">
													<div className="home-icon">
														{option.icon}
													</div>

													<div className="home-title">
														{option.title}
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</Route>
				</Switch>
			</div>
		</>
	);
}
export default App;