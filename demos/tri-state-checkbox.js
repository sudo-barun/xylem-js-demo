import Component from "../lib/js/dom/Component.js";
import createStore from "../lib/js/core/createStore.js";
import forEach from "../lib/js/dom/forEach.js";
import map from "../lib/js/core/map.js";
import mountComponent from "../lib/js/dom/mountComponent.js";
import parseHTML from "../lib/js/dom/parseHTML.js";

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
				forEach(checkboxValue$s, function (item$, index$) {
					const checkboxElement$ = createStore();
					const itemProxy$ = this.bindDataNode(item$);
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
								map(item$, (v) => v ? 'Selected' : 'Not selected'),
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
