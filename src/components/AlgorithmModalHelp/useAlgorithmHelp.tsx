import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import Latex from "./../../components/Latex";

interface AlgorithmModal {
	title: string;
	body: JSX.Element;
};

interface AlgorithmModalProps {
	onOpen?: () => void; 
}

const useAlgorithmHelp = (simulator: string) => {
	const { t } = useTranslation();

	const ALGORITHM_HELP: {[key: string]: {[key: string]: AlgorithmModal}} = {
		"io": {
			"FIFO": {
				title: "First in First Out (FIFO)",
				body:
					<>
						<p>{t("help.modals.io.fcfs.text_1")}</p>
						<p>{t("help.modals.io.fcfs.text_2")}</p>
					</>,
			},

			"SSTF": {
				title: "Shortest Seek Time First (SSTF)",
				body: 
					<>
						<p>
							El algoritmo Shortest Seek Time First atiende primero aquellas peticiones que se encuentran más cerca del cabezal.
						</p>

						<p>
							Este sistema favorece las peticiones que se encuentran cerca del cabezal, desfavoreciendo las peticiones periféricas.
						</p>
					</>
			},
			
			"SCAN": {
				title: "SCAN",
				body: 
					<>
						<p>
							El algoritmo SCAN intenta simular el comportamiento de un ascensor. El cabezal se mueve procesando asi todas las peticiones que se encuentra. Cuando llega a un extremo, realiza el mismo recorrido pero con sentido contrario.
						</p>

						<p>
							El objetivo del algoritmo es reducir los cambios de sentido pero favorece a las peticiones recientes.
						</p>
					</>
			},
			
			"C-SCAN": {
				title: "C-SCAN",
				body: 
					<>
						<p>
							El algoritmo C-SCAN intenta simular el comportamiento de un ascensor como el algoritmo SCAN. El cabezal se mueve en un único sentido (ascendente o descendente) y cuando llega a un extremo se situa rápidamente al contrario sin atender peticiones.
						</p>

						<p>
							El principal objetivo es eliminar la discriminación entre las pistas interiores y las periféricas.
						</p>
					</>
			},

			"LIFO": {
				title: "Last In First Out (LIFO)",
				body: 
					<>
						<p>
							El algoritmo Last In First Out procesa primero la solicitud más reciente que ingresó en la cola de peticiones.
						</p>

						<p>
							Este enfoque prioriza las solicitudes más nuevas, lo que puede provocar que las solicitudes más antiguas experimenten mayores tiempos de espera.
						</p>
					</>
			},

		},
	};

	const [visible, setVisible] = useState<boolean>(false);
	const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("");

	const show = (algorithm: string) => {
		setSelectedAlgorithm(algorithm);
		setVisible(true);
	};

	const close = () => setVisible(false);

	const modal = (props: AlgorithmModalProps) => {
		if (visible && props.onOpen != undefined) {
			props.onOpen();
		}
		
		return (
			<Modal
				onHide={close}
				show={visible}>
				{visible &&
					<>
						<Modal.Header closeButton>
							{ALGORITHM_HELP[simulator][selectedAlgorithm].title}
						</Modal.Header>

						<Modal.Body>
							{ALGORITHM_HELP[simulator][selectedAlgorithm].body}
						</Modal.Body>
					</>
				}

				<Modal.Footer>
					<button 
						onClick={close}
						className="btn btn-secondary">
						{t("common.close")}
					</button>
				</Modal.Footer>
			</Modal>
		);
	}

	return {
		showAlgorithmModal: show,
		AlgorithmModal: modal 
	};
};

export default useAlgorithmHelp;