import arrayToVirtualDom from "../../../lib/ts/dom/arrayToVirtualDom.js";
import Component from "../../../lib/ts/dom/Component.js";
import ComponentItem from "../../../lib/ts/types/ComponentItem.js";
import createStore from "../../../lib/ts/core/createStore.js";
import createVoidStream from "../../../lib/ts/core/createVoidStream.js";
import Image from "../types/Image.js";
import map from "../../../lib/ts/core/map.js";
import SourceStream from "../../../lib/ts/types/SourceStream.js";
import Store from "../../../lib/ts/types/Store.js";
import Subscriber from "../../../lib/ts/types/Subscriber.js";

type Attributes = {
	image: Store<Image>,
	hasPrevious: Store<boolean>,
	hasNext: Store<boolean>,
	onShowPrevious: Subscriber<void>,
	onShowNext: Subscriber<void>,
	onClose: Subscriber<void>,
};

export default
class Preview extends Component<Attributes>
{
	build(attrs: Attributes): ComponentItem[]
	{
		const image$: Store<Image> = this.deriveStore(attrs.image);
		const hasPrevious$: Store<boolean> = this.deriveStore(attrs.hasPrevious);
		const hasNext$: Store<boolean> = this.deriveStore(attrs.hasNext);

		const showPrevious: SourceStream<void> = createVoidStream();
		const showNext: SourceStream<void> = createVoidStream();
		const close: SourceStream<void> = createVoidStream();
		const previewElement$ = createStore<HTMLElement>(undefined!);

		showPrevious.subscribe(attrs.onShowPrevious);
		showNext.subscribe(attrs.onShowNext);
		close.subscribe(attrs.onClose);

		this.afterAttachToDom.subscribe(() => {
			document.body.style.overflow = 'hidden';
			previewElement$().focus();
		});
		this.beforeDetachFromDom.subscribe(() => {
			previewElement$().blur();
			document.body.style.removeProperty('overflow');
		});

		return arrayToVirtualDom([
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
							'@click': close,
						},
						'<button>', {
							title: 'Previous',
							class: '-control -left',
							'.disabled': map(hasPrevious$, (x)=>!x),
							'@click': showPrevious,
						},
						'<div>', { class: '-image-caption-container' },
						[
							'<div>', { class: '-image' },
							[
								'<img>', {
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
							class: '-control -right',
							'.disabled': map(hasNext$, (x)=>!x),
							'@click': showNext,
						},
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
					showPrevious();
					break;
				case 'ArrowRight':
					showNext();
					break;
				case 'Escape':
					close();
					break;
			}
		}
	}
}
