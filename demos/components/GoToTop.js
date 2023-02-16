import arrayToVirtualDom from "../../lib/js/dom/arrayToVirtualDom.js";
import Component from "../../lib/js/dom/Component.js";
import createStore from "../../lib/js/core/createStore.js";
import createStreamOfDomEvent from "../../lib/js/utilities/createStreamOfDomEvent.js";
import map from "../../lib/js/core/map.js";
import throttle from "../../node_modules/lodash-es/throttle.js";

export default
class GoToTop extends Component
{
	build()
	{
		const isVisible$ = createStore(false);

		const throttledChangeVisibility = throttle(() => {
			isVisible$(document.documentElement.scrollTop > window.innerHeight/2);
		}, 100, { leading: false, trailing: true });

		const scrollStream = createStreamOfDomEvent(document, 'scroll');
		scrollStream.subscribe(throttledChangeVisibility);
		this.beforeDetachFromDom.subscribe(scrollStream.unsubscribe);

		return arrayToVirtualDom([
			'<button>', {
				class: 'btn btn-light',
				style: 'position: fixed; right: 0; bottom: 0; margin: 8px;',
				hidden: map(isVisible$, v => !v),
				'@click': function () {
					scroll(0,0);
				},
			},
			[ '↑ Go To Top' ],
			'</button>',
		]);
	}
}
