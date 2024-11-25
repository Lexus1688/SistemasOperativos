import React, { useLayoutEffect, useState } from "react";
import { Col } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import _uniqueId from "lodash/uniqueId";
import TableItem from "./TableItem";

type HeadingType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface TableOfContentProps {
	root: HeadingType;
};

interface TOCItem {
	id: string;
	target: string;
	title: string;
	items: TOCItem[];
	element: HTMLElement;
};

type HeadersDict = {
	[key in HeadingType]?: HTMLCollectionOf<HTMLHeadingElement>
};

/**
 * @param element HTMLElement
 * @returns absolute Y position of an element inside the document
 */
const elementYOffset = (element: HTMLElement) => {
	let bodyRect = document.body.getBoundingClientRect();
	let elemRect = element.getBoundingClientRect();
	return elemRect.top - bodyRect.top;
};

function TableOfContent(props: TableOfContentProps) {
	const location = useLocation();

	// list tree
	const [toc, setTOC] = useState<TOCItem[]>([]);

	// fetch all possible headers
	let headerTags: HeadingType[] = ["h1", "h2", "h3", "h4", "h5", "h6"];
	let headers: HeadersDict = {};
	headerTags.map(tag => headers[tag] = document.getElementsByTagName(tag));

	/**
	 * @param currentHeading current heading level
	 * @param below 
	 * @param above 
	 * @returns a list of TOCItems between the header represented by below and above
	 */
	const findItemsBelowAndAbove = (currentHeading: HeadingType, below: HTMLHeadingElement, above: HTMLHeadingElement | null) => {
		let items: TOCItem[] = [];
		let index: number = headerTags.indexOf(currentHeading);
		
		if (index == (headerTags.length - 1)) {

		} else {
			let nextLevel = headers[headerTags[index + 1]];
			if (nextLevel != undefined) {
				for (let i = 0; i < nextLevel.length; i++) {
					let element = nextLevel[i];

					if ((below.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) 
						&& (above == null ||(above != null && element.compareDocumentPosition(above) & Node.DOCUMENT_POSITION_FOLLOWING))) {

						let nextItem: HTMLHeadingElement | null = above;
						if (i < nextLevel.length - 1) {
							if ((nextLevel[i + 1].compareDocumentPosition(below) & Node.DOCUMENT_POSITION_PRECEDING)
								&& (above == null || (above != null && nextLevel[i + 1].compareDocumentPosition(above) & Node.DOCUMENT_POSITION_FOLLOWING))) {
								nextItem = nextLevel[i + 1];
							}
						}	

						let targetId: string;
						if (element.hasAttribute("id")) {
							targetId = element.getAttribute("id") || "";
						} else {
							targetId = _uniqueId("toc");
							element.setAttribute("id", targetId);
						}

						let item: TOCItem = {
							title: element.innerText,
							items: findItemsBelowAndAbove(
								headerTags[index + 1], 
								element, 
								nextItem
							),
							element: element,
							id: _uniqueId("toc"),
							target: targetId
						};

						items.push(item);
					}
				}
			}
		}

		return items;
	};

	useLayoutEffect(() => {
		let headerRoot = headers[props.root];
		let newTOC: TOCItem[] = [];
		if (headerRoot != undefined) {
			if (headerRoot.length > 0) {
				for (let i = 0; i < headerRoot.length; i++) {
					let targetId: string;
					if (headerRoot[i].hasAttribute("id")) {
						targetId = headerRoot[i].getAttribute("id") || "";
					} else {
						targetId = _uniqueId("toc");
						headerRoot[i].setAttribute("id", targetId);
					}
					
					newTOC.push({
						title: headerRoot[i].innerText,
						items: findItemsBelowAndAbove(
							headerTags[headerTags.indexOf(props.root)],
							headerRoot[i],
							(i == (headerRoot.length - 1)) ? null : headerRoot[i + 1]
						),
						element: headerRoot[i],
						id: _uniqueId("toc"),
						target: targetId
					});
				}
			}
		}

		setTOC(newTOC);

		let onScroll = (event: Event) => {
			
			let minY = Number.MIN_SAFE_INTEGER;
			let element: string | null = null;

			// iterate over all the TOC items
			let stack = [...newTOC];
			let item: TOCItem | undefined;
			while ((item = stack.pop()) != undefined) {
				// mark as not active all the elements
				document.getElementById(item.id)?.classList.remove("active");

				let box = item.element.getBoundingClientRect();
				// the closest section to the scroll is that one with maximum .top
				// below 0
				if (Math.floor(box.top) <= 0 && box.top > minY) {
					minY = Math.floor(box.top);
					element = item.id;
				}
				
				// we must look all the children of this element
				item.items.map(item => stack.push(item));
			}

			if (element != null) {
				// mark the closest element as active
				document.getElementById(element)?.classList.add("active")
			}
		};

		// listen to scroll events to update the selected TOC item
		window.addEventListener("scroll", onScroll);

		// scroll to the selected element, if any and exists
		let search = new URLSearchParams(location.search);
		if (search.has("scrollTo")) {
			let id: string | null = search.get("scrollTo");

			if (id != null && id.length > 0) {
				let element: HTMLElement | null = document.getElementById(id);
				if (element != null) {
					element.scrollIntoView({block: "start", behavior: "smooth" });
				}
			}
		}
		
		// clean-up function
		return () => {
			window.removeEventListener("scroll", onScroll);
		};
	}, []);
	

	return (
		<Col md={4}>
			<div className="toc">
				<span className="title">Tabla de contenidos</span>
				<ul>
					{toc.map(item => 
						<TableItem 
							key={item.id}
							target={item.target}
							id={item.id}
							title={item.title}
							items={item.items} />	
					)}
				</ul>
			</div>
		</Col>
	)
}

export default TableOfContent;
export type { TOCItem };