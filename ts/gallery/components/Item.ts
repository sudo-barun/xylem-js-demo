import parseHTML from "../../../lib/ts/dom/parseHTML.js";
import Component from "../../../lib/ts/dom/Component.js";
import ComponentChildren from "../../../lib/ts/types/ComponentChildren.js";
import createEmittableStream from "../../../lib/ts/core/createEmittableStream.js";
import EmittableStream from "../../../lib/ts/types/EmittableStream.js";
import Image from "../types/Image.js";
import Subscriber from "../../../lib/ts/types/Subscriber.js";

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
						src: image.url,
					}
				],
				'</a>',
			],
			'</div>',
		]);
	}
}
