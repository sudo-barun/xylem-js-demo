import Component from "../node_modules/@xylem-js/xylem-js/dom/Component.js";
import createStore from "../node_modules/@xylem-js/xylem-js/core/createStore.js";
import forEach from "../node_modules/@xylem-js/xylem-js/dom/forEach.js";
import map from "../node_modules/@xylem-js/xylem-js/core/map.js";
import mountComponent from "../node_modules/@xylem-js/xylem-js/dom/mountComponent.js";
import parseHTML from "../node_modules/@xylem-js/xylem-js/dom/parseHTML.js";

const ALL = 1;
const NONE = 0;
const SOME = -1;

const LABELS = {
	[ALL]: 'All',
	[NONE]: 'None',
	[SOME]: 'Some',
};
console.log(LABELS)

class TriStateCheckbox extends Component
{
	build()
	{
		const checkboxValue$s = Array.apply(null, Array(5)).map(() => false).map((v) => createStore(v));
		const getCombinedState = () => {
			const checkedCount = checkboxValue$s.filter((item$) => item$._()).length;
			if (checkedCount === 0) {
				return NONE;
			} else if (checkedCount === checkboxValue$s.length) {
				return ALL;
			} else {
				return SOME;
			}
		};
		const combinedState$ = createStore(getCombinedState());
		checkboxValue$s.forEach(item$ => item$.subscribe(() => {
			combinedState$._(getCombinedState());
		}));

		const topCheckboxElement$ = createStore();

		this.afterAttachToDom.subscribe(() => {
			topCheckboxElement$._().indeterminate = combinedState$._() === SOME;
			topCheckboxElement$._().checked = combinedState$._() === ALL;

			combinedState$.subscribe(() => {
				topCheckboxElement$._().indeterminate = combinedState$._() === SOME;
				topCheckboxElement$._().checked = combinedState$._() === ALL;
			});
		});

		return parseHTML([
			'<div>', { class: 'container', style: 'max-width: 500px' },
			[
				'<div>',
				[
					'<label>',
					[
						'<input/>', {
							type: 'checkbox',
							'@change': (ev) => {
								const checked = ev.target.checked;
								checkboxValue$s.forEach((item$) => item$._(checked));
							},
							'<>': topCheckboxElement$,
						},
						' ',
						'<b>', [ 'Select All' ], '</b>',
						' ',
						'(',
						map(combinedState$, (v) => LABELS[v]),
						' selected)',
					],
					'</label>',
				],
				'</div>',
				forEach(checkboxValue$s, (item$, index$, forEachItem) => {
					const checkboxElement$ = createStore();
					const itemProxy$ = forEachItem.bindSupplier(item$);
					this.afterAttachToDom.subscribe(() => {
						checkboxElement$._().checked = itemProxy$._();
						itemProxy$.subscribe((v) => checkboxElement$._().checked = v);
					});
					return parseHTML([
						'<div>',
						[
							'<label>',
							[
								'<input/>', {
									type: 'checkbox',
									'@change': (ev) => {item$._(ev.target.checked)},
									'<>': checkboxElement$,
								},
								map(index$, v => ` Item ${v+1} (`),
								map(itemProxy$, (v) => v ? 'Selected' : 'Not selected'),
								')'
							],
							'</label>',
						],
						'</div>',
					]);
				})
				.endForEach(),
			],
			'</div>',
		]);
	}
}

mountComponent(new TriStateCheckbox(), document.getElementById('root'));
