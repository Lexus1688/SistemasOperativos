import React, { useEffect, useLayoutEffect, useRef } from "react";

import katex from 'katex';
import "katex/dist/katex.css";

interface LatexProps {
	display?: boolean;
	children: string;
};

function Latex(props: LatexProps) {
	const element = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (element.current != null) {
			katex.render(
				props.children,
				element.current,
				{
					throwOnError: false,
					displayMode: props.display || false
				}
			);
		}
	})

	return (
		<div 
			ref={element}
			style={(!props.display || false) ? { display: "inline-block" } : undefined}>
		</div>
	);
}

export default Latex;