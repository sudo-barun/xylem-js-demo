import parseHTML from "../../../lib/ts/dom/parseHTML.js";
import Component from "../../../lib/ts/dom/Component.js";
import createEmittableStream from "../../../lib/ts/core/createEmittableStream.js";
import createStore from "../../../lib/ts/core/createStore.js";
import map from "../../../lib/ts/core/map.js";
export default class Preview extends Component {
    build(attrs) {
        const image$ = this.bindSupplier(attrs.image$);
        const hasPrevious$ = this.bindSupplier(attrs.hasPrevious$);
        const hasNext$ = this.bindSupplier(attrs.hasNext$);
        const showPrevious = createEmittableStream();
        const showNext = createEmittableStream();
        const close = createEmittableStream();
        const previewElement$ = createStore(undefined);
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
                '@keydown': (ev) => onKeydown(ev.key),
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
                            class: ['-control -left', {
                                    disabled: map(hasPrevious$, (x) => !x),
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
                                [map(image$, (image) => image.caption)],
                                '</span>',
                            ],
                            '</div>',
                        ],
                        '</div>',
                        '<button>', {
                            title: 'Next',
                            class: ['-control -right', {
                                    disabled: map(hasNext$, (x) => !x),
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
        function onKeydown(key) {
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
