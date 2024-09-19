import Root from "../js/ts/gallery/components/Root.js";
import stringifyComponent from "../js/node_modules/@xylem-js/xylem-js/ts/server/stringifyComponent.js";

let initialData = null;


if (Deno.args[0]) {
	const initialDataJSON = Deno.readTextFileSync(Deno.args[0]);
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
