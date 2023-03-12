import parseHTML from "../lib/js/dom/parseHTML.js";
import createStore from "../lib/js/core/createStore.js";
import Component from "../lib/js/dom/Component.js";
import { hydrateComponentChildren } from "../lib/js/dom/hydrate.js";
import mountComponent from "../lib/js/dom/mountComponent.js";

class DynamicTitle extends Component
{
	build()
	{
		const titleText$ = createStore('Dynamic Title');
		const [ element ] = parseHTML([ '<title>', [ titleText$ ], '</title>' ]);

		this.afterAttachToDom.subscribe(() => {
			element.setup();
			hydrateComponentChildren([element], [document.getElementsByTagName('title')[0]]);
			element.setupDom();
		});

		return parseHTML([
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
						'@input': (ev) => titleText$._(ev.target.value),
					},
				],
				'</div>',
			],
			'</div>',
		]);
	}
}

mountComponent(new DynamicTitle(), document.getElementById('root'));
