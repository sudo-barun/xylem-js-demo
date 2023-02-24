import arrayToVirtualDom from "../lib/js/dom/arrayToVirtualDom.js";
import Component from "../lib/js/dom/Component.js";
import createProxyStream from "../lib/js/core/createProxyStream.js";
import createStore from "../lib/js/core/createStore.js";
import if_ from "../lib/js/dom/if_.js";
import map from "../lib/js/core/map.js";
import mount from "../lib/js/dom/mount.js";
import reduce from "../lib/js/core/reduce.js";

function startRequest()
{
	return new Promise((resolve) => {
		const fetchPromise = fetch('autocomplete.json');
		setTimeout(() => {
			fetchPromise.then(resolve);
		}, 3000);
	});
}

function createSetUnsubscribe$(unsubscribe$)
{
	return (unsubscribe) => {
		reduce(unsubscribe$, (oldUnsubscribe, newUnsubscribe) => {
			if (oldUnsubscribe) {
				oldUnsubscribe();
			}
			return newUnsubscribe;
		}, unsubscribe);
	};
}

class IgnorePromiseResult extends Component
{
	build()
	{
		const requestCount$ = createStore(0);
		const responseCount$ = createStore(0);
		const unsubscribe$ = createStore(null);
		const setUnsubscribe$ = createSetUnsubscribe$(unsubscribe$);
		this.beforeDetachFromDom.subscribe(() => setUnsubscribe$(null));

		return arrayToVirtualDom([
			'<div>',
			[
				'<div>',
				[
					'<button>', {
						class: 'btn btn-outline-primary',
						'@click': () => {
							const requestPromise = startRequest();
							const responseStream = createProxyStream((emit) => {
								requestPromise.then(emit);
								reduce(requestCount$, (v) => v+1);
							});
							setUnsubscribe$(responseStream.subscribe((v) => {
								reduce(responseCount$, (v) => v+1);
								console.log('Promise result: ', v);
							}));
						}
					},
					[ 'Start Request' ],
					'</button>',
				],
				'</div>',
				'<div>', [ 'Request count = ', requestCount$ ], '</div>',
				'<div>', [ 'Response count = ', responseCount$ ], '</div>',
			],
			'</div>',
		]);
	}
}

class Root extends Component
{
	build()
	{
		const isShown$ = createStore(true);

		return arrayToVirtualDom([
			'<div>', { class: 'container', style: 'max-width: 500px' },
			[
				'<div>', { class: 'clearfix' },
				[
					'<mark>', [ 'Note: check the Console for response' ], '</mark>',
					'<button>', {
						class: 'btn btn-outline-secondary float-end',
						'@click': () => reduce(isShown$, (v) => !v),
					},
					[ map(isShown$, (v) => v ? 'Hide' : 'Show') ],
					'</button>',
				],
				'</div>',
				if_(isShown$, () => [
					new IgnorePromiseResult(),
				]).endIf(),
			],
			'</div>',
		]);
	}
}

mount(new Root(), document.getElementById('root'));
