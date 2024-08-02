import Root from "../js/ts/gallery/components/Root.js";
import stringifyComponent from "../js/lib/ts/server/stringifyComponent.js";

let initialData = null;

try {
	initialData = JSON.parse(global.INITIAL_DATA_JSON);
} catch {}

const component = new Root();
component.setModifier(modifier);
component.setup();

console.log(stringifyComponent(component));



function modifier(component)
{
	if (component instanceof Root) {
		component.injectAttributes({
			apiBaseUrl: global.API_BASE_URL,
			initialData,
		});
	}
}
