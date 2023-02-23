import arrayToVirtualDom from "../../../lib/ts/dom/arrayToVirtualDom.js";
import block from "../../../lib/ts/dom/block.js";
import Component from "../../../lib/ts/dom/Component.js";
import ComponentItem from "../../../lib/ts/types/ComponentItem.js";
import createStore from "../../../lib/ts/core/createStore.js";
import Image from "../types/Image.js";
import Item from "./Item.js";
import Preview from "./Preview.js";
import SourceStore from "../../../lib/ts/types/SourceStore.js";
import Store from "../../../lib/ts/types/Store.js";

type Attributes = {
	images$: Store<Image[]>,
};

export default
class Gallery extends Component<Attributes>
{
	build(attrs: Attributes): Array<ComponentItem>
	{
		const images$ = this.deriveStore(attrs.images$);
		const previewIndex$: SourceStore<number> = createStore(-1);
		const previewImage$: SourceStore<Image|null> = createStore(null);
		const hasPrevious$: SourceStore<boolean> = createStore(false);
		const hasNext$: SourceStore<boolean> = createStore(false);

		images$.subscribe(() => {
			closePreview();
		});

		return arrayToVirtualDom([
			'<div>', { class: 'container gallery' },
			[
				'<div>', { class: '-image-list' },
				[
					block.forEach(images$, (image, index$) => [
						new Item({
							image,
							onOpenPreview: () => openPreview(index$()),
						}),
					])
					.endForEach(),
				],
				'</div>',
				block.if(previewImage$, () => [
					new Preview({
						image: previewImage$.readonly as Store<Image>,
						hasPrevious: hasPrevious$.readonly,
						hasNext: hasNext$.readonly,
						onShowPrevious: () => showPrevious(),
						onShowNext: () => showNext(),
						onClose: ()=> closePreview(),
					}),
				])
				.endIf(),
			],
			'</div>'
		]);

		function resetPreview()
		{
			previewIndex$(-1);
			previewImage$(null);
		}

		function openPreview(index: number)
		{
			previewIndex$(index);
			previewImage$(images$()[index]);
			updatePreviousNext(index);
		}

		function updatePreviousNext(previewIndex: number)
		{
			hasPrevious$(previewIndex > 0);
			hasNext$((previewIndex > -1) && (previewIndex < images$().length - 1));
		}

		function showPrevious()
		{
			if (previewIndex$() > 0) {
				previewIndex$(previewIndex$() - 1);
				previewImage$(images$()[previewIndex$()]);
				updatePreviousNext(previewIndex$());
			}
		}

		function showNext()
		{
			if (previewIndex$() < images$().length - 1) {
				previewIndex$(previewIndex$() + 1);
				previewImage$(images$()[previewIndex$()]);
				updatePreviousNext(previewIndex$());
			}
		}

		function closePreview()
		{
			resetPreview();
			updatePreviousNext(previewIndex$());
		}
	}
}
