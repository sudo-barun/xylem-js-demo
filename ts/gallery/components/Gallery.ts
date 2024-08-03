import ArrayStore from "../../../node_modules/@xylem-js/xylem-js/ts/types/ArrayStore.js";
import Component from "../../../node_modules/@xylem-js/xylem-js/ts/dom/Component.js";
import ComponentChildren from "../../../node_modules/@xylem-js/xylem-js/ts/types/ComponentChildren.js";
import createArrayStore from "../../../node_modules/@xylem-js/xylem-js/ts/array/createArrayStore.js";
import createStore from "../../../node_modules/@xylem-js/xylem-js/ts/core/createStore.js";
import forEach from "../../../node_modules/@xylem-js/xylem-js/ts/dom/forEach.js";
import if_ from "../../../node_modules/@xylem-js/xylem-js/ts/dom/if_.js";
import Image from "../types/Image.js";
import Item from "./Item.js";
import parseHTML from "../../../node_modules/@xylem-js/xylem-js/ts/dom/parseHTML.js";
import Preview from "./Preview.js";
import push from "../../../node_modules/@xylem-js/xylem-js/ts/array_action/push.js";
import remove from "../../../node_modules/@xylem-js/xylem-js/ts/array_action/remove.js";
import Store from "../../../node_modules/@xylem-js/xylem-js/ts/types/Store.js";
import unshift from "../../../node_modules/@xylem-js/xylem-js/ts/array_action/unshift.js";

type Attributes = {
	images$: Store<Image[]>,
};

export default
class Gallery extends Component<Attributes>
{
	build(attrs: Attributes): ComponentChildren
	{
		const images$ = this.bindSupplier(attrs.images$);
		const previewIndex$: Store<number> = createStore(-1);
		const previewImage$: Store<Image|null> = createStore(null);
		const previewImages$: ArrayStore<Image> = createArrayStore([]);
		const hasPrevious$: Store<boolean> = createStore(false);
		const hasNext$: Store<boolean> = createStore(false);

		const showingPrevious$ = createStore(false);
		const showingNext$ = createStore(false);
		const transitionToPrevious$ = createStore(false);
		const transitionToNext$ = createStore(false);

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
							onOpenPreview: () => openPreview(index$._()),
						}),
					])
					.endForEach(),
				],
				'</div>',
				if_(previewImage$, () => [
					new Preview({
						image$: previewImage$.readonly as Store<Image>,
						images$: previewImages$,
						hasPrevious$: hasPrevious$.readonly,
						hasNext$: hasNext$.readonly,
						onShowPrevious: () => showPrevious(),
						onShowNext: () => showNext(),
						onClose: ()=> closePreview(),
						showingPrevious$,
						showingNext$,
						transitionToPrevious$,
						transitionToNext$,
					}),
				])
				.endIf(),
			],
			'</div>'
		]);

		function resetPreview()
		{
			previewIndex$._(-1);
			previewImage$._(null);
		}

		function openPreview(index: number)
		{
			previewIndex$._(index);
			previewImage$._(images$._()[index]);
			previewImages$._([ images$._()[index] ]);
			updatePreviousNext(index);
		}

		function updatePreviousNext(previewIndex: number)
		{
			hasPrevious$._(previewIndex > 0);
			hasNext$._((previewIndex > -1) && (previewIndex < images$._().length - 1));
		}

		function showPrevious()
		{
			if (showingPrevious$._() || showingNext$._()) {
				return;
			}

			if (previewIndex$._() > 0) {
				previewIndex$._(previewIndex$._() - 1);
				previewImage$._(images$._()[previewIndex$._()]);
				previewImages$.mutate(unshift, images$._()[previewIndex$._()]);
				showingPrevious$._(true);
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						transitionToPrevious$._(true);
						setTimeout(() => {
							previewImages$.mutate(remove, previewImages$._().length - 1);
							showingPrevious$._(false);
							transitionToPrevious$._(false);
						}, 250);
					});
				});
				updatePreviousNext(previewIndex$._());
			}
		}

		function showNext()
		{
			if (showingPrevious$._() || showingNext$._()) {
				return;
			}

			if (previewIndex$._() < images$._().length - 1) {
				previewIndex$._(previewIndex$._() + 1);
				previewImage$._(images$._()[previewIndex$._()]);
				previewImages$.mutate(push, images$._()[previewIndex$._()]);
				showingNext$._(true);
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						transitionToNext$._(true);
						setTimeout(() => {
							previewImages$.mutate(remove, 0);
							showingNext$._(false);
							transitionToNext$._(false);
						}, 250);
					});
				});
				updatePreviousNext(previewIndex$._());
			}
		}

		function closePreview()
		{
			resetPreview();
			updatePreviousNext(previewIndex$._());
		}
	}
}
