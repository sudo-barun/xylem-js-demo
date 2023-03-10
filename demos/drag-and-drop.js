import parseHTML from "../lib/js/dom/parseHTML.js";
import Component from "../lib/js/dom/Component.js";
import createArrayStore from "../lib/js/array/createArrayStore.js";
import createStore from "../lib/js/core/createStore.js";
import forEach from "../lib/js/dom/forEach.js";
import map from "../lib/js/core/map.js";
import mountComponent from "../lib/js/dom/mountComponent.js";
import move from "../lib/js/array/move.js";
import normalizeArrayStore from "../lib/js/array/normalizeArrayStore.js";
import push from "../lib/js/array/push.js";
import "../lib/js/array/registerMove.js";
import "../lib/js/array/registerPush.js";

const COLORS = Object.freeze([
	'red',
	'blue',
	'green',
	'yellow',
	'pink',
	'brown',
]);

const BONUS_COLORS = Object.freeze([
	'magenta',
	'cyan',
	'black',
]);

class App extends Component
{
	build()
	{
		const colors$ = createStore(COLORS.slice());

		return parseHTML([
			'<div>', { class: 'container mt-4 mb-5' },
			[
				'<div>', { class: 'row' },
				[
					'<div>', { class: 'col-xl-8 mx-auto' },
					[
						'<div>', { class: 'row' },
						[
							'<div>', { class: 'col-md-6' },
							[
								'<h1>', { class: 'h2' },
								[ 'Drag and Drop' ],
								'</h1>',
								'<div>', { class: 'alert alert-secondary' },
								[
									'Sort the following list of color in alphabetical order:'
								],
								'</div>',
								new ColorList({
									colors$,
								}),
								new BonusColors({
									colors$,
								}),
							],
							'</div>',
							'<div>', { class: 'col-md-6' },
							[
								'<h2>', { class: 'h3' },
								[ 'Data' ],
								'</h2>',
								'<pre>', {
									style: 'border: 1px solid #ccc; padding: 20px'
								},
								[
									'<code>',
									[
										map(colors$, (v) => JSON.stringify(
											v, null, 2
										)),
									],
									'</code>',
								],
								'</pre>',
							],
							'</div>',
						],
						'</div>',
					],
					'</div>',
				],
				'</div>',
			],
			'</div>',
		]);
	}
}

class ColorList extends Component
{
	build(attrs)
	{
		const colors$ = createArrayStore(attrs.colors$().slice());
		const normalized = normalizeArrayStore(colors$, createStore);
		normalized.subscribe(attrs.colors$);

		return parseHTML([
			'<div>', { class: 'list-group' },
			[
				forEach(colors$, (color, index$) => {
					const isDraggable$ = createStore(false);
					return parseHTML([
						'<div>', {
							class: 'list-group-item',
							draggable: map(isDraggable$, String),
							'@dragstart': (ev) => {
								ev.dataTransfer.setData(
									'application/json',
									JSON.stringify({
										source: 'colors',
										index: index$(),
									})
								);
							},
							'@dragend': () => isDraggable$(false),
							'@drop': (ev) => {
								ev.preventDefault();
								let dropData;
								try {
									dropData = JSON.parse(ev.dataTransfer.getData('application/json'));
								} catch (ex) {
									return;
								}
								if (dropData.source === 'colors') {
									const droppedColorIndex = dropData.index;
									if (droppedColorIndex === index$()) {
										return;
									}
									colors$.mutate(move, droppedColorIndex, index$);
								} else if (dropData.source === 'bonusColors') {
									const droppedBonusIndex = dropData.index;
									colors$.mutate(push, BONUS_COLORS[droppedBonusIndex]);
									colors$.mutate(move, colors$().length - 1, index$);
								}
							},
							'@dragover': (ev) => ev.preventDefault(),
						},
						[
							'<span>', { class: 'fw-bold' },
							[ color ],
							'</span>',
							'<span>', {
								class: 'badge text-bg-light float-end fs-6',
								style: 'cursor: move; margin-right: 16px',
								'@mousedown': () => isDraggable$(true),
								'@mouseup': () => isDraggable$(false),
							},
							[ '⇵' ],
							'</span>',
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

class BonusColors extends Component
{
	build(attrs)
	{
		const colors$ = this.bindDataNode(attrs.colors$);

		return parseHTML([
			'<h2>', { class: 'h3 mt-4' },
			[ 'Bonus Colors' ],
			'</h2>',
			'<div>',
			[
				forEach(BONUS_COLORS, (bonusColor, index$) => parseHTML([
					index$() !== 0 ? ' ' : '',
					'<span>', {
						class: [ 'btn btn-outline-secondary fs-6 fw-bold', {
							disabled: map(colors$, v => v.includes(bonusColor)),
						}],
						draggable: 'true',
						'@dragstart': (ev) => {
							ev.dataTransfer.setData(
								'application/json',
								JSON.stringify({
									source: 'bonusColors',
									index: index$(),
								})
							);
						},
					},
					[ bonusColor ],
					'</span>',
				]))
				.endForEach(),
			],
			'</div>',
		]);
	}
}

mountComponent(new App(), document.getElementById('app-container'));
