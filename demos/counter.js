import arrayToVirtualDom from "../lib/js/dom/arrayToVirtualDom.js";
import Component from "../lib/js/dom/Component.js";
import createStore from "../lib/js/core/createStore.js";
import map from "../lib/js/core/map.js";
import mount from "../lib/js/dom/mount.js";
import reduce from "../lib/js/core/reduce.js";

const INITIAL_VALUE = 0;
const MAX = 5;

class Counter extends Component
{
	build()
	{
		const count$ = createStore(INITIAL_VALUE);

		return arrayToVirtualDom([
			'<div>', { class: 'container' },
			[
				'<h2>', ['Counter'], '</h2>',
				'<p>',
				[
					'You clicked: ', '<mark>', [count$], '</mark>', ' times.',
					' ',
					'(max: ', MAX, ')',
				],
				'</p>',
				'<button>', {
					'@click': () => reduce(count$, (v) => v + 1),
					'disabled': map(count$, (v) => v + 1 > MAX)
				},
				['Click'],
				'</button>',
				' ',
				'<button>', {
					'@click': () => count$(INITIAL_VALUE),
					'disabled': map(count$, (v) => v === INITIAL_VALUE),
				},
				['Reset'],
				'</button>',
			],
			'</div>',
		]);
	}
}

mount(new Counter(), document.getElementById('root'));
  