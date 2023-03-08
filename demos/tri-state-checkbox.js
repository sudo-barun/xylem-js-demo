import arrayToVirtualDom from "../lib/js/dom/arrayToVirtualDom.js";
import Component from "../lib/js/dom/Component.js";
import createStore from "../lib/js/core/createStore.js";
import forEach from "../lib/js/dom/forEach.js";
import map from "../lib/js/core/map.js";
import mount from "../lib/js/dom/mount.js";

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
			const checkedCount = checkboxValue$s.filter((item$) => item$()).length;
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
			combinedState$(getCombinedState());
		}));

		const topCheckboxElement$ = createStore();

		this.afterAttachToDom.subscribe(() => {
			topCheckboxElement$().indeterminate = combinedState$() === SOME;
			topCheckboxElement$().checked = combinedState$() === ALL;

			combinedState$.subscribe(() => {
				topCheckboxElement$().indeterminate = combinedState$() === SOME;
				topCheckboxElement$().checked = combinedState$() === ALL;
			});
		});

		return arrayToVirtualDom([
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
								checkboxValue$s.forEach((item$) => item$(checked));
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
					const itemProxy$ = this.createProxyStore(item$);
					this.afterAttachToDom.subscribe(() => {
						checkboxElement$().checked = itemProxy$();
						itemProxy$.subscribe((v) => checkboxElement$().checked = v);
					});
					return arrayToVirtualDom([
						'<div>',
						[
							'<label>',
							[
								'<input/>', {
									type: 'checkbox',
									'@change': (ev) => {item$(ev.target.checked)},
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

mount(new TriStateCheckbox(), document.getElementById('root'));
