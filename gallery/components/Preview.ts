import ArraySupplier from "../../node_modules/@xylem-js/xylem-js/types/ArraySupplier";
import combineSuppliers from "../../node_modules/@xylem-js/xylem-js/core/combineSuppliers.js";
import Component from "../../node_modules/@xylem-js/xylem-js/dom/Component.js";
import ComponentChildren from "../../node_modules/@xylem-js/xylem-js/types/ComponentChildren.js";
import createEmittableStream from "../../node_modules/@xylem-js/xylem-js/core/createEmittableStream.js";
import createStore from "../../node_modules/@xylem-js/xylem-js/core/createStore.js";
import EmittableStream from "../../node_modules/@xylem-js/xylem-js/types/EmittableStream.js";
import forEach from "../../node_modules/@xylem-js/xylem-js/dom/forEach.js";
import Image from "../types/Image.js";
import map from "../../node_modules/@xylem-js/xylem-js/core/map.js";
import parseHTML from "../../node_modules/@xylem-js/xylem-js/dom/parseHTML.js";
import Subscriber from "../../node_modules/@xylem-js/xylem-js/types/Subscriber.js";
import Supplier from "../../node_modules/@xylem-js/xylem-js/types/Supplier.js";

type Attributes = {
	image$: Supplier<Image>,
	images$: ArraySupplier<Image>,
	hasPrevious$: Supplier<boolean>,
	hasNext$: Supplier<boolean>,
	onShowPrevious: Subscriber<void>,
	onShowNext: Subscriber<void>,
	onClose: Subscriber<void>,
	showingPrevious$: Supplier<boolean>,
	showingNext$: Supplier<boolean>,
	transitionToPrevious$: Supplier<boolean>,
	transitionToNext$: Supplier<boolean>,
};

export default
class Preview extends Component<Attributes>
{
	build(attrs: Attributes): ComponentChildren
	{
		const image$: Supplier<Image> = this.bindSupplier(attrs.image$);
		const images$: ArraySupplier<Image> = attrs.images$;
		const hasPrevious$: Supplier<boolean> = this.bindSupplier(attrs.hasPrevious$);
		const hasNext$: Supplier<boolean> = this.bindSupplier(attrs.hasNext$);
		const showingPrevious$ = attrs.showingPrevious$;
		const showingNext$ = attrs.showingNext$;
		const transitionToPrevious$ = attrs.transitionToPrevious$;
		const transitionToNext$ = attrs.transitionToNext$;

		const showPrevious: EmittableStream<void> = createEmittableStream();
		const showNext: EmittableStream<void> = createEmittableStream();
		const close: EmittableStream<void> = createEmittableStream();
		const previewElement$ = createStore<HTMLElement>(undefined!);

		showPrevious.subscribe(attrs.onShowPrevious);
		showNext.subscribe(attrs.onShowNext);
		close.subscribe(attrs.onClose);

		this.afterAttachToDom.subscribe(() => {
			document.body.style.overflow = 'hidden';
			previewElement$._().focus();
		});
		this.beforeDetachFromDom.subscribe(() => {
			previewElement$._().blur();
			document.body.style.removeProperty('overflow');
		});

		return parseHTML([
			'<div>', {
				class: '-preview',
				tabindex: '-1',
				'@keydown': (ev: KeyboardEvent) => onKeydown(ev.key),
				'<>': previewElement$,
			},
			[
				'<div>', { class: '-box' },
				[
					'<div>', { class: '-content' },
					[
						'<button>', {
							title: 'Close',
							class: '-close',
							'@click': () => close._(),
						},
						'</button>',
						'<button>', {
							title: 'Previous',
							class: [ '-control -left', {
								disabled: map(hasPrevious$, (x)=>!x),
							}],
							'@click': () => showPrevious._(),
						},
						'</button>',
						'<div>', {
							class: {
								'-transition-to-previous': transitionToPrevious$,
								'-transition-to-next': transitionToNext$,
							},
							style: 'flex-grow: 1; height: 100%; position: relative;',
						},
						[
							forEach(images$, (image, index$) => {
								return parseHTML([
									'<div>', {
										class: [ '-image-caption-container', {
											'-is-previous': map(
												combineSuppliers<[number, boolean, number]>([ images$.length$, showingPrevious$, index$ ]),
												([ l, sp, i ]) => (l > 1) && sp && (i === 0)
											),
											'-is-next': map(
												combineSuppliers<[number, boolean, number]>([ images$.length$, showingNext$, index$ ]),
												([ l, sn, i ]) => (l > 1) && sn && (i === 1)
											),
										}],
									},
									[
										'<div>', { class: '-image' },
										[
											'<img/>', {
												src: image.preview.url,
												alt: '',
												width: image.preview.width,
												height: image.preview.height,
											},
										],
										'</div>',
										'<div>', { class: '-caption' },
										[
											'<span>', { class: '-text' },
											[ image.caption ],
											'</span>',
										],
										'</div>',
									],
									'</div>',
								]);
							})
							.endForEach(),
						],
						'</div>',
						'<button>', {
							title: 'Next',
							class: [ '-control -right', {
								disabled: map(hasNext$, (x)=>!x),
							}],
							'@click': () => showNext._(),
						},
						'</button>',
					],
					'</div>',
				],
				'</div>',
			],
			'</div>',
		]);

		function onKeydown(key: string)
		{
			switch (key) {
				case 'ArrowLeft':
				case 'Left':
					showPrevious._();
					break;
				case 'ArrowRight':
				case 'Right':
					showNext._();
					break;
				case 'Escape':
				case 'Esc':
					close._();
					break;
			}
		}
	}
}
