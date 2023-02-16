import arrayToVirtualDom from "../../../lib/ts/dom/arrayToVirtualDom.js";
import Component from "../../../lib/ts/dom/Component.js";
import createVoidStream from "../../../lib/ts/core/createVoidStream.js";
export default class Item extends Component {
    build(attrs) {
        const image = attrs.image;
        const openPreview = createVoidStream();
        openPreview.subscribe(attrs.onOpenPreview);
        return arrayToVirtualDom([
            '<div>', { class: '-image-list-item' },
            [
                '<a>', {
                    href: '#',
                    '@click': (ev) => { ev.preventDefault(); openPreview(); },
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
