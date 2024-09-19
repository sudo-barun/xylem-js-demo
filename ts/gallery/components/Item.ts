import parseHTML from "../../../node_modules/@xylem-js/xylem-js/ts/dom/parseHTML.js";
import Component from "../../../node_modules/@xylem-js/xylem-js/ts/dom/Component.js";
import ComponentChildren from "../../../node_modules/@xylem-js/xylem-js/ts/types/ComponentChildren.js";
import createEmittableStream from "../../../node_modules/@xylem-js/xylem-js/ts/core/createEmittableStream.js";
import EmittableStream from "../../../node_modules/@xylem-js/xylem-js/ts/types/EmittableStream.js";
import Image from "../types/Image.js";
import Subscriber from "../../../node_modules/@xylem-js/xylem-js/ts/types/Subscriber.js";

type Attributes = {
	image: Image,
	onOpenPreview: Subscriber<void>,
};

export default
class Item extends Component<Attributes>
{
	build(attrs: Attributes): ComponentChildren
	{
		const image = attrs.image;
		const openPreview: EmittableStream<void> = createEmittableStream();

		openPreview.subscribe(attrs.onOpenPreview);

		return parseHTML([
			'<div>', { class: '-image-list-item' },
			[
				'<a>', {
					href: '#',
					'@click': (ev: Event)=> { ev.preventDefault(); openPreview._(); },
					'aria-label': image.caption,
				},
				[
					'<img/>', {
						src: image.thumbnail.url,
						alt: '',
						width: image.thumbnail.width,
						height: image.thumbnail.height,
					}
				],
				'</a>',
			],
			'</div>',
		]);
	}
}
