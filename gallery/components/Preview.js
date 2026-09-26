import combine from "../../node_modules/@xylem-js/xylem-js/core/combine.js";
import Component from "../../node_modules/@xylem-js/xylem-js/dom/Component.js";
import createEmittableStream from "../../node_modules/@xylem-js/xylem-js/core/createEmittableStream.js";
import createStore from "../../node_modules/@xylem-js/xylem-js/core/createStore.js";
import forEach from "../../node_modules/@xylem-js/xylem-js/dom/forEach.js";
import map from "../../node_modules/@xylem-js/xylem-js/core/map.js";
import parseHTML from "../../node_modules/@xylem-js/xylem-js/dom/parseHTML.js";
export default class Preview extends Component {
    build(attrs) {
        const { images$, hasPrevious$, hasNext$ } = attrs;
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
        this.afterAttach.subscribe(() => {
            document.body.style.overflow = 'hidden';
            previewElement$._().focus();
        });
        this.beforeDetach.subscribe(() => {
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
                                    disabled: map(this, hasPrevious$, (x) => !x),
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
                            forEach(images$, function (image, index$) {
                                return parseHTML([
                                    '<div>', {
                                        class: ['-image-caption-container', {
                                                '-is-previous': map(this, combine(this, [images$.length$, showingPrevious$, index$]), ([l, sp, i]) => (l > 1) && sp && (i === 0)),
                                                '-is-next': map(this, combine(this, [images$.length$, showingNext$, index$]), ([l, sn, i]) => (l > 1) && sn && (i === 1)),
                                            }],
                                    },
                                    [
                                        '<div>', { class: '-image' },
                                        [
                                            '<img/>', {
                                                src: image.preview.url,
                                                alt: '',
                                                width: image.preview.width,
                                                height: image.preview.height,
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
                                    disabled: map(this, hasNext$, (x) => !x),
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
