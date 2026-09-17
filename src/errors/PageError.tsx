import { Flex } from "../flex";

interface PageErrorProps {
	code: string | number;
	title: string;
	description: string;
}

export function PageError({ code, title, description }: PageErrorProps) {
	return (
		<Flex.Predefined variant="columnCenter" className="paddingXl">
			<div aria-hidden="true" className="content2 fontBolded" style={{ fontSize: "5em" }}>
				{code}
			</div>
			<h2>{title}</h2>
			<p>{description}</p>
			{/* <Link to="/">Вернуться на главную</Link> */}
		</Flex.Predefined>
	);
}
