import arrayToVirtualDom from '../../../lib/ts/dom/arrayToVirtualDom.js';
import block from '../../../lib/ts/dom/block.js';
import Component from '../../../lib/ts/dom/Component.js';
import createStore from '../../../lib/ts/core/createStore.js';
import Gallery from './Gallery.js';
import map from "../../../lib/ts/core/map.js";
export default class Root extends Component {
    build() {
        const galleryImages = createStore([]);
        const hasImageRequestCompleted = createStore(false);
        const hasImageRequestSucceed = createStore(false);
        delayPromise(getImages(), 2000)
            .then((images) => {
            galleryImages(images);
            hasImageRequestSucceed(true);
        })
            .catch(() => hasImageRequestSucceed(false))
            .finally(() => hasImageRequestCompleted(true));
        return arrayToVirtualDom([
            '<div>', { class: 'section-wrapper' },
            [
                '<div>', { class: 'toolbar' },
                [
                    '<div>', { class: 'container' },
                    [
                        '<h1>', { class: 'heading' },
                        ['Gallery'],
                        '</h1>',
                    ],
                    '</div>',
                ],
                '</div>',
                '<div>', { class: 'section-content' },
                [
                    '<div>', { class: 'container' },
                    [
                        '<p>',
                        [
                            '<b>', ['Gallery'], '</b>',
                            ' is a ???? component made to showcase images.',
                        ],
                        '</p>',
                    ],
                    '</div>',
                    block.if(hasImageRequestCompleted, () => arrayToVirtualDom([
                        block.if(hasImageRequestSucceed, () => arrayToVirtualDom([
                            block.if(map(galleryImages, (arr) => arr.length), () => arrayToVirtualDom([
                                new Gallery({
                                    images$: galleryImages,
                                }),
                            ]))
                                .else(() => arrayToVirtualDom([
                                '<div>', { class: 'gallery-empty-text' },
                                ['No image available'],
                                '</div>',
                            ])),
                        ]))
                            .else(() => arrayToVirtualDom([
                            '<div>', { class: 'gallery-fail-text' },
                            ['Failed to load image due to error'],
                            '</div>',
                        ])),
                    ]))
                        .else(() => arrayToVirtualDom([
                        '<div>', { class: 'gallery gallery-loading container gallery-container' },
                        [
                            '<div>', { class: '-image-list' },
                            [
                                '<div>', { class: '-image-list-item' },
                                [
                                    '<div>', { class: 'loading-box' }, '</div>',
                                ],
                                '</div>',
                                '<div>', { class: '-image-list-item' },
                                [
                                    '<div>', { class: 'loading-box' }, '</div>',
                                ],
                                '</div>',
                                '<div>', { class: '-image-list-item' },
                                [
                                    '<div>', { class: 'loading-box' }, '</div>',
                                ],
                                '</div>',
                                '<div>', { class: '-image-list-item' },
                                [
                                    '<div>', { class: 'loading-box' }, '</div>',
                                ],
                                '</div>',
                                '<div>', { class: '-image-list-item' },
                                [
                                    '<div>', { class: 'loading-box' }, '</div>',
                                ],
                                '</div>',
                                '<div>', { class: '-image-list-item hidden--lte-sm' },
                                [
                                    '<div>', { class: 'loading-box' }, '</div>',
                                ],
                                '</div>',
                                '<div>', { class: '-image-list-item hidden--lte-sm' },
                                [
                                    '<div>', { class: 'loading-box' }, '</div>',
                                ],
                                '</div>',
                                '<div>', { class: '-image-list-item hidden--lte-sm' },
                                [
                                    '<div>', { class: 'loading-box' }, '</div>',
                                ],
                                '</div>',
                            ],
                            '</div>',
                        ],
                        '</div>',
                    ])),
                ],
                '</div>',
                '<footer>', { class: 'footer' },
                [
                    '<div>', { class: 'container text-center' },
                    [
                        'Made with ???? by ', '<b>', ['Barun Kharel'], '</b>',
                    ],
                    '</div>',
                ],
                '</footer>',
            ],
            '</div>',
        ]);
    }
}
function delayPromise(promise, delay) {
    return Promise.allSettled([
        promise,
        setTimeoutPromisified(delay),
    ])
        .then(([result]) => {
        if (result.status === 'fulfilled') {
            return Promise.resolve(result.value);
        }
        else {
            return Promise.reject(result.reason);
        }
    });
}
function setTimeoutPromisified(delay, ...args) {
    return new Promise(resolve => setTimeout(resolve, delay, ...args));
}
function getImages() {
    return fetch(getUrl())
        .then(response => response.json());
}
function getUrl() {
    return env.APP_IMAGES_API_URL + '/image/';
}
