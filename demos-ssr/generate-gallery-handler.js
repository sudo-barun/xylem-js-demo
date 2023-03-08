import parse from "../js/lib/ts/server/parse.js";
import Root from "../js/ts/gallery/components/Root.js";

const component = new Root();
component.setModifier(modifier);

let initialData = null;

try {
	initialData = JSON.parse(global.INITIAL_DATA_JSON);
} catch {}

console.log(parse(component));



function modifier(component)
{
	if (component instanceof Root) {
		component.injectAttributes({
			apiBaseUrl: global.API_BASE_URL,
			initialData,
		});
	}
}
