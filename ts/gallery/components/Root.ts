import arrayToVirtualDom from '../../../lib/ts/dom/arrayToVirtualDom.js';
import Component from '../../../lib/ts/dom/Component.js';
import createStore from '../../../lib/ts/core/createStore.js';
import Gallery from './Gallery.js';
import if_ from '../../../lib/ts/dom/if_.js';
import Image from '../types/Image.js';
import map from "../../../lib/ts/core/map.js";

export default
class Root extends Component
{
	build()
	{
		const galleryImages$ = createStore<Image[]>([]);
		const hasImageRequestCompleted$ = createStore(false);
		const hasImageRequestSucceed$ = createStore(false);

		this.afterAttachToDom.subscribe(() => {
			delayPromise(getImages(), 2000)
			.then((images) => {
				galleryImages$(images);
				hasImageRequestSucceed$(true);
			})
			.catch(() => hasImageRequestSucceed$(false))
			.finally(() => hasImageRequestCompleted$(true))
			;
		});

		return arrayToVirtualDom([
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
					if_(hasImageRequestCompleted$, () => arrayToVirtualDom([
						if_(hasImageRequestSucceed$, () => arrayToVirtualDom([
							if_(map(galleryImages$, (arr)=>arr.length), () => arrayToVirtualDom([
								new Gallery({
									images$: galleryImages$,
								}),
							]))
							.else(() => arrayToVirtualDom([
								'<div>', { class: 'gallery-empty-text' },
								[ 'No image available' ],
								'</div>',
							]))
							.endIf(),
						]))
						.else(() => arrayToVirtualDom([
							'<div>', { class: 'gallery-fail-text' },
							[ 'Failed to load image due to error' ],
							'</div>',
						]))
						.endIf(),
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

function getImages(): Promise<Image[]>
{
	return fetch(getUrl())
	.then(response => response.json())
	;
}

function getUrl()
{
	return env.APP_IMAGES_API_URL+'/image/';
}
