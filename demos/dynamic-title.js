import arrayToVirtualDom from "../lib/js/dom/arrayToVirtualDom.js";
import createStore from "../lib/js/core/createStore.js";
import Component from "../lib/js/dom/Component.js";
import Element from "../lib/js/dom/Element.js";
import { hydrateComponentItems } from "../lib/js/dom/hydrate.js";
import mount from "../lib/js/dom/mount.js";
import Text from "../lib/js/dom/Text.js";

class DynamicTitle extends Component
{
	build()
	{
		const titleText$ = createStore('Dynamic Title');
		const element = new Element('title', {}, [new Text(titleText$)]);

		this.afterAttachToDom.subscribe(() => {
			element.setup();
			hydrateComponentItems([element], [document.getElementsByTagName('title')[0]]);
			element.setupDom();
		});

		return arrayToVirtualDom([
			'<div>', {
				class: 'container mt-5'
			},
			[
				'<h2>',
				['Dynamic title'],
				'</h2>',
				'<p>',
				['Edit the form field and check the title in the browser tab.'],
				'</p>',
				'<div>',
				[
					'Title text: ',
					'<input/>', {
						value: titleText$,
						'@input': (ev) => titleText$(ev.target.value),
					},
				],
				'</div>',
			],
			'</div>',
		]);
	}
}

mount(new DynamicTitle(), document.getElementById('root'));
