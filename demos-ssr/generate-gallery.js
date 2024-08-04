import fs from "fs";
import Root from "../js/ts/gallery/components/Root.js";
import stringifyComponent from "../js/node_modules/@xylem-js/xylem-js/ts/server/stringifyComponent.js";

let initialData = null;


if (process.argv[2]) {
	const initialDataJSON = fs.readFileSync(process.argv[2], 'utf-8');
	initialData = JSON.parse(initialDataJSON);
}

const component = new Root();
component.setModifier(modifier);
component.setup();

console.log(stringifyComponent(component));



function modifier(component)
{
	if (component instanceof Root) {
		component.injectAttributes({
			apiBaseUrl: '',
			initialData,
		});
	}
}
