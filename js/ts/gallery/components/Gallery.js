import arrayToVirtualDom from "../../../lib/ts/dom/arrayToVirtualDom.js";
import block from "../../../lib/ts/dom/block.js";
import Component from "../../../lib/ts/dom/Component.js";
import createStore from "../../../lib/ts/core/createStore.js";
import Item from "./Item.js";
import Preview from "./Preview.js";
export default class Gallery extends Component {
    build(attrs) {
        const images$ = this.deriveStore(attrs.images$);
        const previewIndex$ = createStore(-1);
        const previewImage$ = createStore(null);
        const hasPrevious$ = createStore(false);
        const hasNext$ = createStore(false);
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
                        image: previewImage$.readonly,
                        hasPrevious: hasPrevious$.readonly,
                        hasNext: hasNext$.readonly,
                        onShowPrevious: () => showPrevious(),
                        onShowNext: () => showNext(),
                        onClose: () => closePreview(),
                    }),
                ])
                    .endIf(),
            ],
            '</div>'
        ]);
        function resetPreview() {
            previewIndex$(-1);
            previewImage$(null);
        }
        function openPreview(index) {
            previewIndex$(index);
            previewImage$(images$()[index]);
            updatePreviousNext(index);
        }
        function updatePreviousNext(previewIndex) {
            hasPrevious$(previewIndex > 0);
            hasNext$((previewIndex > -1) && (previewIndex < images$().length - 1));
        }
        function showPrevious() {
            if (previewIndex$() > 0) {
                previewIndex$(previewIndex$() - 1);
                previewImage$(images$()[previewIndex$()]);
                updatePreviousNext(previewIndex$());
            }
        }
        function showNext() {
            if (previewIndex$() < images$().length - 1) {
                previewIndex$(previewIndex$() + 1);
                previewImage$(images$()[previewIndex$()]);
                updatePreviousNext(previewIndex$());
            }
        }
        function closePreview() {
            resetPreview();
            updatePreviousNext(previewIndex$());
        }
    }
}
