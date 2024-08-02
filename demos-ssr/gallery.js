import hydrate from "./js/lib/ts/dom/hydrate.js";
import Root from "./js/ts/gallery/components/Root.js";

const component = new Root(INITIAL_DATA);
component.setModifier(modifier);
component.setup();
console.log(component);
hydrate(component, document.getElementById('root-container').childNodes);
component.setupDom();

document.removeEventListener('click', listenerToPreventAnchorClick);

component.notifyAfterAttachToDom();

function modifier(component)
{
	if (component instanceof Root) {
		component.injectAttributes({
			apiBaseUrl: 'http://localhost/projects/image-api-symfony/public',
			initialData: window.INITIAL_DATA,
		});
	}
}
