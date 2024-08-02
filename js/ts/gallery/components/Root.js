import parseHTML from '../../../node_modules/@xylem-js/xylem-js/ts/dom/parseHTML.js';
import Component from '../../../node_modules/@xylem-js/xylem-js/ts/dom/Component.js';
import createStore from '../../../node_modules/@xylem-js/xylem-js/ts/core/createStore.js';
import Gallery from './Gallery.js';
import if_ from '../../../node_modules/@xylem-js/xylem-js/ts/dom/if_.js';
import createArrayStore from '../../../node_modules/@xylem-js/xylem-js/ts/array/createArrayStore.js';
export default class Root extends Component {
    build({ apiBaseUrl, initialData = null }) {
        const galleryImages$ = createArrayStore([]);
        const hasImageRequestCompleted$ = createStore(false);
        const hasImageRequestSucceed$ = createStore(false);
        if (initialData === null) {
            this.afterAttachToDom.subscribe(() => {
                delayPromise(getImages(apiBaseUrl), 2000)
                    .then((images) => {
                    galleryImages$._(images);
                    hasImageRequestSucceed$._(true);
                })
                    .catch(() => hasImageRequestSucceed$._(false))
                    .finally(() => hasImageRequestCompleted$._(true));
            });
        }
        else {
            galleryImages$._(initialData.galleryImages);
            hasImageRequestCompleted$._(true);
            hasImageRequestSucceed$._(true);
        }
        return parseHTML([
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
                            ' is a XylemJS component made to showcase images.',
                        ],
                        '</p>',
                    ],
                    '</div>',
                    if_(hasImageRequestCompleted$, () => parseHTML([
                        if_(hasImageRequestSucceed$, () => parseHTML([
                            if_(galleryImages$.length$, () => parseHTML([
                                new Gallery({
                                    images$: galleryImages$,
                                }),
                            ]))
                                .else(() => parseHTML([
                                '<div>', { class: 'gallery-empty-text' },
                                ['No image available'],
                                '</div>',
                            ]))
                                .endIf(),
                        ]))
                            .else(() => parseHTML([
                            '<div>', { class: 'gallery-fail-text' },
                            ['Failed to load image due to error'],
                            '</div>',
                        ]))
                            .endIf(),
                    ]))
                        .else(() => parseHTML([
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
                    ]))
                        .endIf(),
                ],
                '</div>',
                '<footer>', { class: 'footer' },
                [
                    '<div>', { class: 'container text-center' },
                    [
                        'Made with XylemJS by ', '<b>', ['Barun Kharel'], '</b>',
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
function getImages(apiBaseUrl) {
    return fetch('https://picsum.photos/v2/list?page=10')
        .then(response => response.json())
        .then(images => images.slice(0, 10).map(image => ({
        url: image.download_url,
        caption: `${image.download_url} (by ${image.author})`,
    })));
    // return fetch(getUrl(apiBaseUrl))
    // .then(response => response.json())
    // ;
}
function getUrl(apiBaseUrl) {
    return apiBaseUrl + '/image/';
}
