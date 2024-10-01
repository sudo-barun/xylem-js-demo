import parseHTML from "../../node_modules/@xylem-js/xylem-js/dom/parseHTML.js";
import Component from "../../node_modules/@xylem-js/xylem-js/dom/Component.js";
import createEmittableStream from "../../node_modules/@xylem-js/xylem-js/core/createEmittableStream.js";
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
