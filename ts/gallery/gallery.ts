import Component from '../../lib/ts/dom/Component.js';
import mount from '../../lib/ts/dom/mount.js';
import Root from './components/Root.js';

mount((() => {
	const component = new Root();
	component.setModifier(modifier);
	return component;
})(), document.getElementById('root')!);

function modifier(component: Component)
{
	if (component instanceof Root) {
		component.injectAttributes({
			apiBaseUrl: 'http://localhost/projects/image-api-symfony/public',
		});
	}
}
