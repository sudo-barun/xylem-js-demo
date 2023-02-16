import arrayToVirtualDom from "../lib/js/dom/arrayToVirtualDom.js";
import createStore from "../lib/js/core/createStore.js";
import Component from "../lib/js/dom/Component.js";
import Element from "../lib/js/dom/Element.js";
import flow from "../node_modules/lodash-es/flow.js";
import mount from "../lib/js/dom/mount.js";
import syncWithDom from "../lib/js/dom/syncWithDom.js";
import Text from "../lib/js/dom/Text.js";

class DynamicTitle extends Component
{
	build()
	{
		const titleText = createStore('Dynamic Title');
		const element = new Element('title', {}, [new Text(titleText)]);

		syncWithDom(element, document.querySelector('title'));

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
					'<input>', {
						value: titleText,
						'@input': flow([
							(ev) => ev.target.value,
							titleText,
						]),
					},
				],
				'</div>',
			],
			'</div>',
		]);
	}
}

mount(new DynamicTitle(), document.getElementById('root'));
