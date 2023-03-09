import Component from "./Component.js";
export default class IfElseBlockItem extends Component {
    build(attributes) {
        const isActive$ = this.deriveStore(attributes.isActive$);
        isActive$.subscribe(() => {
            this.reload();
        });
        if (isActive$()) {
            return attributes.build.apply(this);
        }
        return [];
    }
}
