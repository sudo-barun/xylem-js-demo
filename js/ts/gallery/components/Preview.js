import combineSuppliers from "../../../node_modules/@xylem-js/xylem-js/ts/core/combineSuppliers.js";
import Component from "../../../node_modules/@xylem-js/xylem-js/ts/dom/Component.js";
import createEmittableStream from "../../../node_modules/@xylem-js/xylem-js/ts/core/createEmittableStream.js";
import createStore from "../../../node_modules/@xylem-js/xylem-js/ts/core/createStore.js";
import forEach from "../../../node_modules/@xylem-js/xylem-js/ts/dom/forEach.js";
import map from "../../../node_modules/@xylem-js/xylem-js/ts/core/map.js";
import parseHTML from "../../../node_modules/@xylem-js/xylem-js/ts/dom/parseHTML.js";
export default class Preview extends Component {
    build(attrs) {
        const image$ = this.bindSupplier(attrs.image$);
        const images$ = attrs.images$;
        const hasPrevious$ = this.bindSupplier(attrs.hasPrevious$);
        const hasNext$ = this.bindSupplier(attrs.hasNext$);
        const showingPrevious$ = attrs.showingPrevious$;
        const showingNext$ = attrs.showingNext$;
        const transitionToPrevious$ = attrs.transitionToPrevious$;
        const transitionToNext$ = attrs.transitionToNext$;
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
                                        class: ['-image-caption-container', {
                                                '-is-previous': map(combineSuppliers([images$.length$, showingPrevious$, index$]), ([l, sp, i]) => (l > 1) && sp && (i === 0)),
                                                '-is-next': map(combineSuppliers([images$.length$, showingNext$, index$]), ([l, sn, i]) => (l > 1) && sn && (i === 1)),
                                            }],
                                        '@transitionend': (ev) => {
                                            console.log(ev);
                                        },
                                    },
                                    [
                                        '<div>', { class: '-image' },
                                        [
                                            '<img/>', {
                                                src: image.url,
                                            },
                                        ],
                                        '</div>',
                                        '<div>', { class: '-caption' },
                                        [
                                            '<span>', { class: '-text' },
                                            [image.caption],
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
