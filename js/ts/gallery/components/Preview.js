import arrayToVirtualDom from "../../../lib/ts/dom/arrayToVirtualDom.js";
import Component from "../../../lib/ts/dom/Component.js";
import createStore from "../../../lib/ts/core/createStore.js";
import createVoidStream from "../../../lib/ts/core/createVoidStream.js";
import map from "../../../lib/ts/core/map.js";
export default class Preview extends Component {
    build(attrs) {
        const image$ = this.deriveStore(attrs.image);
        const hasPrevious$ = this.deriveStore(attrs.hasPrevious);
        const hasNext$ = this.deriveStore(attrs.hasNext);
        const showPrevious = createVoidStream();
        const showNext = createVoidStream();
        const close = createVoidStream();
        const previewElement$ = createStore(undefined);
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
                            '@click': close,
                        },
                        '</button>',
                        '<button>', {
                            title: 'Previous',
                            class: ['-control -left', {
                                    disabled: map(hasPrevious$, (x) => !x),
                                }],
                            '@click': showPrevious,
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
                            '@click': showNext,
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
                    showPrevious();
                    break;
                case 'ArrowRight':
                case 'Right':
                    showNext();
                    break;
                case 'Escape':
                case 'Esc':
                    close();
                    break;
            }
        }
    }
}
