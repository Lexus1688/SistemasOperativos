import React from "react";
import { useTranslation } from "react-i18next";
import LocaleImage from "../components/LocaleImage";


import HardDrive_es from "./../assets/images/help/hard_drive_es.svg";
import HardDrive_ca from "./../assets/images/help/hard_drive_ca.svg";
import AddRequest_es from "./../assets/images/help/io_add_request_es.png";
import AddRequest_ca from "./../assets/images/help/io_add_request_ca.png";
import RemoveRequest from "./../assets/images/help/io_remove_request.png";

function IOHelp() {
	const { t } = useTranslation();

	return (
		<>
			<h2>{t("help.io.title")}</h2>
			<p>{t("help.io.text_1")}</p>

			<h3>{t("help.io.hdd_parts")}</h3>
			
			<div className="text-center">
				<LocaleImage 
					width="70%"
					languages={{ ca: HardDrive_ca, es: HardDrive_es }}
					default={HardDrive_es} />
			</div>
			<p>
				{t("help.io.text_2")}
				<ul>
					<li>
						{t("help.io.text_2_1")}
						<br/>
						{t("help.io.text_2_2")}
					</li>

					<li>{t("help.io.text_2_3")}</li>
					<li>{t("help.io.text_2_4")}</li>
					<li>{t("help.io.text_2_5")}</li>
					<li>{t("help.io.text_2_6")}</li>
				</ul>
			</p>

			<h3>{t("help.algorithms")}</h3>
			<h4>FCFS</h4>
			<p>{t("help.modals.io.fcfs.text_1")}</p>
			<p>{t("help.modals.io.fcfs.text_2")}</p>

			<h4>SSTF</h4>
			<p>{t("help.modals.io.sstf.text_1")}</p>
			<p>{t("help.modals.io.sstf.text_2")}</p>

			<h4>SCAN</h4>
			<p>{t("help.modals.io.scan.text_1")}</p>
			<p>{t("help.modals.io.scan.text_2")}</p>

			<h4>C-SCAN</h4>
			<p>{t("help.modals.io.cscan.text_1")}</p>
			<p>{t("help.modals.io.cscan.text_2")}</p>

			<h4>LOOK</h4>
			<p>{t("help.modals.io.look.text_1")}</p>
			<p>{t("help.modals.io.look.text_2")}</p>
			
			<h4>C-LOOK</h4>
			<p>{t("help.modals.io.clook.text_1")}</p>
			
			<h3>{t("help.working")}</h3>
			<p>{t("help.io.working.text_1")}</p>
			<p>{t("help.io.working.text_2")}</p>
			<p>{t("help.io.working.text_3")}</p>

			<div className="text-center">
				<LocaleImage 
					languages={{ ca: AddRequest_ca, es: AddRequest_es }}
					default={AddRequest_es} />
			</div>

			<p>{t("help.io.working.text_4")}</p>

			<div className="text-center">
				<img width="250px" src={RemoveRequest} />
			</div>

			<p>
				{t("help.io.working.text_5")}
				<ul>
					<li>{t("help.io.working.text_5_1")}</li>
					<li>{t("help.io.working.text_5_2")}</li>
				</ul>
			</p>
		</>
	)
}

export default IOHelp;