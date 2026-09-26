import parseHTML from '../../node_modules/@xylem-js/xylem-js/dom/parseHTML.js';
import Component from '../../node_modules/@xylem-js/xylem-js/dom/Component.js';
import createStore from '../../node_modules/@xylem-js/xylem-js/core/createStore.js';
import map from '../../node_modules/@xylem-js/xylem-js/core/map.js';
import Gallery from './Gallery.js';
import if_ from '../../node_modules/@xylem-js/xylem-js/dom/if_.js';
import createArrayStore from '../../node_modules/@xylem-js/xylem-js/array/createArrayStore.js';
let page = 29;
let page$ = createStore(page);
function randomizePage() {
    page = Math.floor(Math.random() * 30) + 1;
    page$._(page);
}
export default class Root extends Component {
    build({ apiBaseUrl, initialData = null }) {
        const galleryImages$ = createArrayStore([]);
        const hasImageRequestCompleted$ = createStore(false);
        const hasImageRequestSucceed$ = createStore(false);
        function loadData() {
            hasImageRequestCompleted$._(false);
            hasImageRequestSucceed$._(false);
            delayPromise(getImages(apiBaseUrl), 2000)
                .then((images) => {
                galleryImages$._(images);
                hasImageRequestSucceed$._(true);
            })
                .catch(() => hasImageRequestSucceed$._(false))
                .finally(() => hasImageRequestCompleted$._(true));
        }
        if (initialData === null) {
            this.afterAttach.subscribe(() => {
                loadData();
            });
        }
        else {
            galleryImages$._(normalizeImage(initialData.galleryImages));
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
                    '<div>', {
                        class: 'container',
                        style: 'display: flex; justify-content: end; gap: 8px',
                    },
                    [
                        '<button>', {
                            'class': 'refresh-button',
                            'disabled': map(this, hasImageRequestCompleted$, v => !v),
                            '@click': () => {
                                randomizePage(),
                                    loadData();
                            },
                        },
                        [
                            'Random',
                        ],
                        '</button>',
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
                    '<div>',
                    [
                        'Page ',
                        page$,
                    ],
                    '</div>',
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
let ajaxLib;
if (typeof window !== 'undefined') {
    ajaxLib = typeof window.fetch !== 'undefined' ? 'fetch' : 'xhr';
}
else {
    ajaxLib = 'fetch';
}
function getImages(apiBaseUrl) {
    if (ajaxLib === 'fetch')
        return fetch(`https://picsum.photos/v2/list?page=${page}`)
            .then(response => response.json())
            .then(images => normalizeImage(images));
    else
        return new Promise((res) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `https://picsum.photos/v2/list?page=${page}`);
            xhr.addEventListener('load', function () {
                res(JSON.parse(xhr.responseText));
            });
            xhr.send();
        }).then(images => normalizeImage(images));
}
function normalizeImage(images) {
    return images.slice(0, 10).map(image => ({
        author: image.author,
        url: image.download_url,
        thumbnail: {
            url: image.download_url.replace(/https:\/\/picsum.photos\/id\/([0-9]+)\/([0-9]+)\/([0-9]+)/, (_, id) => `https://picsum.photos/id/${id}/200`),
            width: 200,
            height: 200,
        },
        preview: {
            url: image.download_url.replace(/https:\/\/picsum.photos\/id\/([0-9]+)\/([0-9]+)\/([0-9]+)/, (_, id) => `https://picsum.photos/id/${id}/1000`),
            width: 1000,
            height: 1000,
        },
        caption: `${image.download_url} (by ${image.author})`,
    }));
}
function getUrl(apiBaseUrl) {
    return apiBaseUrl + '/image/';
}
