import parseHTML from "../node_modules/@xylem-js/xylem-js/dom/parseHTML.js";
import createStore from "../node_modules/@xylem-js/xylem-js/core/createStore.js";
import Component from "../node_modules/@xylem-js/xylem-js/dom/Component.js";
import { hydrateComponentChildren } from "../node_modules/@xylem-js/xylem-js/dom/hydrate.js";
import mountComponent from "../node_modules/@xylem-js/xylem-js/dom/mountComponent.js";

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
