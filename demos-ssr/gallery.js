import hydrateComponent from "../js/node_modules/@xylem-js/xylem-js/ts/dom/hydrateComponent.js";
import Root from "../js/ts/gallery/components/Root.js";

const component = new Root(INITIAL_DATA);
component.setModifier(modifier);

hydrateComponent(component, document.getElementById('root-container').childNodes);

document.removeEventListener('click', listenerToPreventAnchorClick);

function modifier(component)
{
	if (component instanceof Root) {
		component.injectAttributes({
			apiBaseUrl: 'http://localhost/projects/image-api-symfony/public',
			initialData: window.INITIAL_DATA,
		});
	}
}
