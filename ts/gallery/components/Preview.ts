import parseHTML from "../../../lib/ts/dom/parseHTML.js";
import Component from "../../../lib/ts/dom/Component.js";
import ComponentChildren from "../../../lib/ts/types/ComponentChildren.js";
import createEmittableStream from "../../../lib/ts/core/createEmittableStream.js";
import createStore from "../../../lib/ts/core/createStore.js";
import DataNode from "../../../lib/ts/types/DataNode.js";
import Image from "../types/Image.js";
import map from "../../../lib/ts/core/map.js";
import EmittableStream from "../../../lib/ts/types/EmittableStream.js";
import Subscriber from "../../../lib/ts/types/Subscriber.js";

type Attributes = {
	image: DataNode<Image>,
	hasPrevious: DataNode<boolean>,
	hasNext: DataNode<boolean>,
	onShowPrevious: Subscriber<void>,
	onShowNext: Subscriber<void>,
	onClose: Subscriber<void>,
};

export default
class Preview extends Component<Attributes>
{
	build(attrs: Attributes): ComponentChildren
	{
		const image$: DataNode<Image> = this.bindDataNode(attrs.image);
		const hasPrevious$: DataNode<boolean> = this.bindDataNode(attrs.hasPrevious);
		const hasNext$: DataNode<boolean> = this.bindDataNode(attrs.hasNext);

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
						'<div>', { class: '-image-caption-container' },
						[
							'<div>', { class: '-image' },
							[
								'<img/>', {
									src: map(image$, (image) => image.url)
								},
							],
							'</div>',
							'<div>', { class: '-caption' },
							[
								'<span>', { class: '-text' },
								[ map(image$, (image) => image.caption) ],
								'</span>',
							],
							'</div>',
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
