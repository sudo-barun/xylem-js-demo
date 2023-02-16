import arrayToVirtualDom from "../../../lib/ts/dom/arrayToVirtualDom.js";
import Component from "../../../lib/ts/dom/Component.js";
import ComponentItem from "../../../lib/ts/types/ComponentItem.js";
import createVoidStream from "../../../lib/ts/core/createVoidStream.js";
import Image from "../types/Image.js";
import SourceStream from "../../../lib/ts/types/SourceStream.js";
import Subscriber from "../../../lib/ts/types/Subscriber.js";

type Attributes = {
	image: Image,
	onOpenPreview: Subscriber<void>,
};

export default
class Item extends Component<Attributes>
{
	build(attrs: Attributes): ComponentItem[]
	{
		const image = attrs.image;
		const openPreview: SourceStream<void> = createVoidStream();

		openPreview.subscribe(attrs.onOpenPreview);

		return arrayToVirtualDom([
			'<div>', { class: '-image-list-item' },
			[
				'<a>', {
					href: '#',
					'@click': (ev: Event)=> { ev.preventDefault(); openPreview(); },
					'aria-label': image.caption,
				},
				[
					'<img>', {
						src: image.url,
					}
				],
				'</a>',
			],
			'</div>',
		]);
	}
}
