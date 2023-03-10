import parseHTML from "../../../lib/ts/dom/parseHTML.js";
import Component from "../../../lib/ts/dom/Component.js";
import ComponentChildren from "../../../lib/ts/types/ComponentChildren.js";
import createStore from "../../../lib/ts/core/createStore.js";
import forEach from "../../../lib/ts/dom/forEach.js";
import if_ from "../../../lib/ts/dom/if_.js";
import Image from "../types/Image.js";
import Item from "./Item.js";
import Preview from "./Preview.js";
import Store from "../../../lib/ts/types/Store.js";

type Attributes = {
	images$: Store<Image[]>,
};

export default
class Gallery extends Component<Attributes>
{
	build(attrs: Attributes): ComponentChildren
	{
		const images$ = this.bindDataNode(attrs.images$);
		const previewIndex$: Store<number> = createStore(-1);
		const previewImage$: Store<Image|null> = createStore(null);
		const hasPrevious$: Store<boolean> = createStore(false);
		const hasNext$: Store<boolean> = createStore(false);

		images$.subscribe(() => {
			closePreview();
		});

		return parseHTML([
			'<div>', { class: 'container gallery' },
			[
				'<div>', { class: '-image-list' },
				[
					forEach(images$, (image, index$) => [
						new Item({
							image,
							onOpenPreview: () => openPreview(index$()),
						}),
					])
					.endForEach(),
				],
				'</div>',
				if_(previewImage$, () => [
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
