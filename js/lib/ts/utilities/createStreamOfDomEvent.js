import createProxyStream from "../core/createProxyStream.js";
export default function createStreamOfDomEvent(eventTarget, eventName) {
    return createProxyStream((sourceStream) => {
        eventTarget.addEventListener(eventName, sourceStream);
        return () => {
            eventTarget.removeEventListener(eventName, sourceStream);
        };
    });
}
