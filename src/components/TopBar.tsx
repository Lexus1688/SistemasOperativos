import React from "react";
import { Row, Col, Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { IoIosHelpBuoy } from "react-icons/io";
import { BsFillGridFill, BsFillSquareFill } from "react-icons/bs";

interface TopBarProps {
	simpleView?: boolean;
	onChangeView?: (isSimpleView: boolean) => void;
	onClickTutorial?: () => void;
	children?: React.ReactNode;
}

function TopBar(props: TopBarProps) {
	const { t } = useTranslation();

	let callbackFn = props.onChangeView || (() => {});

	return (
		<Row className="mb-3">
			<Col>
				<button
					data-tut="repeat_tutorial"
					onClick={props.onClickTutorial}
					className="btn btn-sm btn-outline-secondary">
					<IoIosHelpBuoy className="mr-1" />
					{t("common.buttons.tutorial")}
				</button>


				<div
					data-tut="view_bar"
					className="btn-group float-right d-none d-md-block">
					<input 
						type="radio"
						name="view-select"
						id="comparaison-view-button"
						checked={!props.simpleView}
						onChange={() => callbackFn(false)}
						className="btn-check" />

					<label 
						htmlFor="comparaison-view-button"
						className="btn btn-sm btn-outline-secondary">
						<BsFillGridFill className="mr-1" />
						{t("common.buttons.comparaisonview")}
					</label>

					<input 
						type="radio"
						name="view-select"
						id="simple-view-button"
						checked={props.simpleView}
						onChange={() => callbackFn(true)}
						className="btn-check" />

					<label
						htmlFor="simple-view-button"
						className="btn btn-sm btn-outline-secondary">
						<BsFillSquareFill className="mr-1" />
						{t("common.buttons.simpleview")}
					</label>
				</div>

				<div
					data-tut="view_bar"
					className="float-right d-sm-block d-md-none">
					
					<Dropdown>
						<Dropdown.Toggle variant="outline-secondary" size="sm">
							{props.simpleView ?
								<>
									<BsFillSquareFill className="mr-1" />
									{t("common.buttons.simpleview")}
								</>
								:
								<>
									<BsFillGridFill className="mr-1" />
									{t("common.buttons.comparaisonview")}
								</>
							}
						</Dropdown.Toggle>

						<Dropdown.Menu>
							<Dropdown.Item onClick={() => callbackFn(true)}>
								<BsFillSquareFill className="mr-1" />
								{t("common.buttons.simpleview")}
							</Dropdown.Item>
							<Dropdown.Item onClick={() => callbackFn(false)}>
								<BsFillGridFill className="mr-1" />
								{t("common.buttons.comparaisonview")}
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</div>

				{props.children}
			</Col>
		</Row>
	);
};

export default TopBar;