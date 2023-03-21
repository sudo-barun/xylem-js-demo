import parseHTML from "../../../lib/ts/dom/parseHTML.js";
import Component from "../../../lib/ts/dom/Component.js";
import createStore from "../../../lib/ts/core/createStore.js";
import forEach from "../../../lib/ts/dom/forEach.js";
import if_ from "../../../lib/ts/dom/if_.js";
import Item from "./Item.js";
import Preview from "./Preview.js";
export default class Gallery extends Component {
    build(attrs) {
        const images$ = this.bindSupplier(attrs.images$);
        const previewIndex$ = createStore(-1);
        const previewImage$ = createStore(null);
        const hasPrevious$ = createStore(false);
        const hasNext$ = createStore(false);
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
                        image$: previewImage$.readonly,
                        hasPrevious$: hasPrevious$.readonly,
                        hasNext$: hasNext$.readonly,
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
            previewIndex$._(-1);
            previewImage$._(null);
        }
        function openPreview(index) {
            previewIndex$._(index);
            previewImage$._(images$._()[index]);
            updatePreviousNext(index);
        }
        function updatePreviousNext(previewIndex) {
            hasPrevious$._(previewIndex > 0);
            hasNext$._((previewIndex > -1) && (previewIndex < images$._().length - 1));
        }
        function showPrevious() {
            if (previewIndex$._() > 0) {
                previewIndex$._(previewIndex$._() - 1);
                previewImage$._(images$._()[previewIndex$._()]);
                updatePreviousNext(previewIndex$._());
            }
        }
        function showNext() {
            if (previewIndex$._() < images$._().length - 1) {
                previewIndex$._(previewIndex$._() + 1);
                previewImage$._(images$._()[previewIndex$._()]);
                updatePreviousNext(previewIndex$._());
            }
        }
        function closePreview() {
            resetPreview();
            updatePreviousNext(previewIndex$._());
        }
    }
}
