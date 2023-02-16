import arrayToVirtualDom from "../lib/js/dom/arrayToVirtualDom.js";
import block from "../lib/js/dom/block.js";
import Component from "../lib/js/dom/Component.js";
import createProxyStore from "../lib/js/core/createProxyStore.js";
import createStore from "../lib/js/core/createStore.js";
import createStream from "../lib/js/core/createStream.js";
import mount from "../lib/js/dom/mount.js";
import throttle from "../node_modules/lodash-es/throttle.js";

function saveEditorData(data)
{
	return new Promise((res) => {
		setTimeout(() => {
			return res('Data saved');
		}, 1000);
	});
}

class Wysiwyg extends Component
{
	build()
	{
		const textareaElement$ = createStore();
		const isSaving$ = createStore(false);
		const editor$ = createStore();

		const editorDataGetter = () => {
			return editor$() ? editor$().getData() : null;
		};
		const editorDataStream = createStream();
		const editorData$ = createProxyStore(editorDataGetter, editorDataStream);
		editorData$.subscribe((val) => {
			isSaving$(true);
			saveEditorData(val)
			.then((val) => {
				return console.log(val);
			})
			.finally(() => {
				return isSaving$(false);
			});
		});

		const throttledEditorChange = throttle(() => {
			editorDataStream(editorDataGetter());
		}, 2500, {
			leading: false,
			trailing: true
		});

		editor$.subscribe((editor) => {
			editorDataStream(editorDataGetter());
			editor.model.document.on('change:data', throttledEditorChange);
		});

		this.afterAttachToDom.subscribe(() => {
			ClassicEditor.create(textareaElement$())
			.then((editor) => editor$(editor))
			.catch((error) => {
				console.error(error);
			});
		});

		return arrayToVirtualDom([
			'<div>', {
				class: 'container'
			},
			[
				'<h2>', ['WYSIWYG Editor'], '</h2>',
				'<p>', ['Note: This uses "CKEditor".'], '</p>',
				'<div>',
				[
					'<textarea>', {
						id: 'editor',
						'<>': textareaElement$,
					},
					[
						() => '<p><i>Hello</i>, <b>World</b>!',
					],
					'</textarea>',
				],
				'</div>',
				block.if(isSaving$, () => arrayToVirtualDom([
					'<mark>', ['Auto saving...'], '</mark>',
				])),
				'<pre>', {
					style: {
						border: '5px solid #ccc',
						padding: '10px',
						'white-space': 'normal'
					},
				},
				[editorData$],
				'</pre>',
			],
			'</div>',
		]);
	}
}

mount(new Wysiwyg(), document.getElementById('root'));
