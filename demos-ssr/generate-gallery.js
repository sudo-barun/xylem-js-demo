import fs from "fs";
import parse from "../js/lib/ts/server/parse.js";
import Root from "../js/ts/gallery/components/Root.js";

const component = new Root();
component.setModifier(modifier);

let initialData = null;


if (process.argv[2]) {
	const initialDataJSON = fs.readFileSync(process.argv[2], 'utf-8');
	initialData = JSON.parse(initialDataJSON);
}

console.log(parse(component));



function modifier(component)
{
	if (component instanceof Root) {
		component.injectAttributes({
			apiBaseUrl: '',
			initialData,
		});
	}
}
