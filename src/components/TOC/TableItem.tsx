import React, { MouseEvent } from "react";
import { TOCItem } from "./TableOfContent";

interface TableItemProps {
	id: string;
	target: string;
	title: string;
	items: TOCItem[];
}

function TableItem(props: TableItemProps) {
	let onClick = (e: MouseEvent, id: string) => {
		e.preventDefault();

		let element: HTMLElement | null = document.getElementById(id);

		if (element != null) {
			element.scrollIntoView({block: "start", behavior: "smooth" });
		}
	};

	return (
		<>
			<li id={props.id}>
				<a href="#" onClick={(e: MouseEvent) => onClick(e, props.target)}>{props.title}</a>
			</li>

			{props.items.length > 0 &&
				<ul>
					{props.items.map(item =>
						<TableItem 
							key={item.id}
							target={item.target}
							id={item.id}
							title={item.title}
							items={item.items} />    
					)}
				</ul>
			}
		</>
	)
}

export default TableItem;