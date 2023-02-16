import arrayToVirtualDom from "../lib/js/dom/arrayToVirtualDom.js";
import block from "../lib/js/dom/block.js";
import createStore from "../lib/js/core/createStore.js";
import createStream from "../lib/js/core/createStream.js";
import Component from "../lib/js/dom/Component.js";
import mount from "../lib/js/dom/mount.js";
import throttle from "../node_modules/lodash-es/throttle.js";
import createProxyStore from "../lib/js/core/createProxyStore.js";

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
		const textarea = createStore();
		const jsonData = createStore('');
		const isSavingInProgress = createStore(false);

		const jsonStringify = (v) => {
			return jsonData(JSON.stringify(v));
		};

		this.afterAttachToDom.subscribe(() => {
			ClassicEditor.create(textarea())
			.then((editor) => {
				const getter = () => {
					return editor.getData();
				};
				const stream = createStream();
				const editorDataProxy = createProxyStore(getter, stream);
				const throttledEditorChange = throttle(() => {
					stream(getter());
				}, 2500, {
					leading: false,
					trailing: true
				});
				editor.model.document.on('change:data', throttledEditorChange);
				jsonStringify(editorDataProxy());
				editorDataProxy.subscribe(jsonStringify);
				editorDataProxy.subscribe((val) => {
					isSavingInProgress(true);
					saveEditorData(val)
					.then((val) => {
						return console.log(val);
					})
					.finally(() => {
						return isSavingInProgress(false);
					});
				});
			})
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
						'<>': textarea,
					},
					[
						() => '<p><i>Hello</i>, <b>World</b>!',
					],
					'</textarea>',
				],
				'</div>',
				block.if(isSavingInProgress, () => arrayToVirtualDom([
					'<mark>', ['Auto saving...'], '</mark>',
				])),
				'<pre>', {
					style: {
						border: '5px solid #ccc',
						padding: '10px',
						'white-space': 'normal'
					},
				},
				[jsonData],
				'</pre>',
			],
			'</div>',
		]);
	}
}

mount(new Wysiwyg(), document.getElementById('root'));
