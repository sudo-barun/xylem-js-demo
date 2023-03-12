import Component from "../lib/js/dom/Component.js";
import createStore from "../lib/js/core/createStore.js";
import cumulate from "../lib/js/core/cumulate.js";
import map from "../lib/js/core/map.js";
import mountComponent from "../lib/js/dom/mountComponent.js";
import parseHTML from "../lib/js/dom/parseHTML.js";

const INITIAL_VALUE = 0;
const MAX = 5;

class Counter extends Component
{
	build()
	{
		const count$ = createStore(INITIAL_VALUE);

		return parseHTML([
			'<div>', { class: 'container', style: 'max-width: 500px' },
			[
				'<h2>', ['Counter'], '</h2>',
				'<p>',
				[
					'You clicked ',
					'<mark>', {
						style: 'font-size: 2em; padding: 10px 10px 5px; display: inline-block',
					},
					[ count$ ],
					'</mark>',
					' times.',
					' ',
					'(max: ', MAX, ')',
				],
				'</p>',
				'<button>', {
					'@click': () => cumulate(count$, (v) => v + 1),
					'disabled': map(count$, (v) => v + 1 > MAX)
				},
				['Click'],
				'</button>',
				' ',
				'<button>', {
					'@click': () => count$._(INITIAL_VALUE),
					'disabled': map(count$, (v) => v === INITIAL_VALUE),
				},
				['Reset'],
				'</button>',
			],
			'</div>',
		]);
	}
}

mountComponent(new Counter(), document.getElementById('root'));
  