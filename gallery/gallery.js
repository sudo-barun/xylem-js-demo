import mountComponent from '../node_modules/@xylem-js/xylem-js/dom/mountComponent.js';
import Root from './components/Root.js';
mountComponent((() => {
    const component = new Root();
    component.setModifier(modifier);
    return component;
})(), document.getElementById('root'));
function modifier(component) {
    if (component instanceof Root) {
        component.injectAttributes({
            apiBaseUrl: 'http://localhost/projects/image-api-symfony/public',
        });
    }
}
