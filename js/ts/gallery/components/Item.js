import parseHTML from "../../../lib/ts/dom/parseHTML.js";
import Component from "../../../lib/ts/dom/Component.js";
import createEmittableStream from "../../../lib/ts/core/createEmittableStream.js";
export default class Item extends Component {
    build(attrs) {
        const image = attrs.image;
        const openPreview = createEmittableStream();
        openPreview.subscribe(attrs.onOpenPreview);
        return parseHTML([
            '<div>', { class: '-image-list-item' },
            [
                '<a>', {
                    href: '#',
                    '@click': (ev) => { ev.preventDefault(); openPreview._(); },
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
