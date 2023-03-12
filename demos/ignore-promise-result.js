import parseHTML from "../lib/js/dom/parseHTML.js";
import Component from "../lib/js/dom/Component.js";
import createStore from "../lib/js/core/createStore.js";
import createStream from "../lib/js/core/createStream.js";
import if_ from "../lib/js/dom/if_.js";
import map from "../lib/js/core/map.js";
import mountComponent from "../lib/js/dom/mountComponent.js";
import cumulate from "../lib/js/core/cumulate.js";

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
		cumulate(unsubscribe$, (oldUnsubscribe$, newUnsubscribe$) => {
			if (oldUnsubscribe$) {
				oldUnsubscribe$._();
			}
			return newUnsubscribe$;
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

		return parseHTML([
			'<div>',
			[
				'<div>',
				[
					'<button>', {
						class: 'btn btn-outline-primary',
						'@click': () => {
							const requestPromise = startRequest();
							const responseStream = createStream((emit) => {
								requestPromise.then((v) => emit._(v));
								cumulate(requestCount$, (v) => v+1);
							});
							setUnsubscribe$(responseStream.subscribe((v) => {
								cumulate(responseCount$, (v) => v+1);
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

		return parseHTML([
			'<div>', { class: 'container', style: 'max-width: 500px' },
			[
				'<div>', { class: 'clearfix' },
				[
					'<mark>', [ 'Note: check the Console for response' ], '</mark>',
					'<button>', {
						class: 'btn btn-outline-secondary float-end',
						'@click': () => cumulate(isShown$, (v) => !v),
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

mountComponent(new Root(), document.getElementById('root'));
