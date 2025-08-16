import Component from "../../node_modules/@xylem-js/xylem-js/dom/Component.js";
import createStore from "../../node_modules/@xylem-js/xylem-js/core/createStore.js";
import createStreamOfDomEvent from "../../node_modules/@xylem-js/xylem-js/utilities/createStreamOfDomEvent.js";
import map from "../../node_modules/@xylem-js/xylem-js/core/map.js";
import parseHTML from "../../node_modules/@xylem-js/xylem-js/dom/parseHTML.js";
import throttle from "../../node_modules/lodash-es/throttle.js";

export default
class GoToTop extends Component
{
	build()
	{
		const isVisible$ = createStore(false);

		const throttledChangeVisibility = throttle(() => {
			isVisible$._(document.documentElement.scrollTop > window.innerHeight/2);
		}, 100, { leading: false, trailing: true });

		const scrollStream = createStreamOfDomEvent(document, 'scroll');
		scrollStream.subscribe(throttledChangeVisibility);
		this.beforeDetach.subscribe(scrollStream.unsubscribe);

		return parseHTML([
			'<button>', {
				class: 'btn btn-light',
				style: 'position: fixed; right: 0; bottom: 0; margin: 8px;',
				hidden: map(this, isVisible$, v => !v),
				'@click': function () {
					scroll(0,0);
				},
			},
			[ '↑ Go To Top' ],
			'</button>',
		]);
	}
}
