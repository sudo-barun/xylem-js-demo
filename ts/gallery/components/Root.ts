import parseHTML from '../../../node_modules/@xylem-js/xylem-js/ts/dom/parseHTML.js';
import Component from '../../../node_modules/@xylem-js/xylem-js/ts/dom/Component.js';
import createStore from '../../../node_modules/@xylem-js/xylem-js/ts/core/createStore.js';
import Gallery from './Gallery.js';
import if_ from '../../../node_modules/@xylem-js/xylem-js/ts/dom/if_.js';
import Image from '../types/Image.js';
import createArrayStore from '../../../node_modules/@xylem-js/xylem-js/ts/array/createArrayStore.js';

type InjectedAttributes = {
	apiBaseUrl: string,
	initialData?: null|{ galleryImages: Image[] },
};

export default
class Root extends Component<{}, InjectedAttributes>
{
	build({ apiBaseUrl, initialData = null }: InjectedAttributes)
	{
		const galleryImages$ = createArrayStore<Image>([]);
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
				.finally(() => hasImageRequestCompleted$._(true))
				;
			});
		} else {
			galleryImages$._(initialData.galleryImages);
			hasImageRequestCompleted$._(true);
			hasImageRequestSucceed$._(true);
		}

		return parseHTML([
			'<div>', { class: 'section-wrapper'},
			[
				'<div>', { class: 'toolbar' },
				[
					'<div>', { class: 'container' },
					[
						'<h1>', { class: 'heading' },
						[ 'Gallery' ],
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
							'<b>',['Gallery'],'</b>',
							' is a ???? component made to showcase images.',
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
								[ 'No image available' ],
								'</div>',
							]))
							.endIf(),
						]))
						.else(() => parseHTML([
							'<div>', { class: 'gallery-fail-text' },
							[ 'Failed to load image due to error' ],
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

function delayPromise<T>(promise: Promise<T>, delay: number)
{
	return Promise.allSettled([
		promise,
		setTimeoutPromisified(delay),
	])
	.then(([result]) => {
		if (result.status === 'fulfilled') {
			return Promise.resolve(result.value);
		} else {
			return Promise.reject(result.reason);
		}
	})
	;
}

function setTimeoutPromisified(delay: number, ...args: any[])
{
	return new Promise(resolve => setTimeout(resolve, delay, ...args));
}

function getImages(apiBaseUrl: string): Promise<Image[]>
{
	return fetch(getUrl(apiBaseUrl))
	.then(response => response.json())
	;
}

function getUrl(apiBaseUrl: string)
{
	return apiBaseUrl+'/image/';
}
