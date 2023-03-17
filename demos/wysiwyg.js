import Component from "../lib/js/dom/Component.js";
import createSupplier from "../lib/js/core/createSupplier.js";
import createEmittableStream from "../lib/js/core/createEmittableStream.js";
import createStore from "../lib/js/core/createStore.js";
import if_ from "../lib/js/dom/if_.js";
import mountComponent from "../lib/js/dom/mountComponent.js";
import parseHTML from "../lib/js/dom/parseHTML.js";
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

		const editorDataGetter = {
			_: () => {
				return editor$._() ? editor$._().getData() : textareaElement$._().innerText;
			},
		};
		const editorDataStream = createEmittableStream();
		const editorData$ = createSupplier(editorDataGetter, editorDataStream);
		editorData$.subscribe((val) => {
			isSaving$._(true);
			saveEditorData(val)
			.then((val) => {
				return console.log(val);
			})
			.finally(() => {
				return isSaving$._(false);
			});
		});

		const throttledEditorChange = throttle(() => {
			editorDataStream._(editorDataGetter._());
		}, 2500, {
			leading: false,
			trailing: true
		});

		editor$.subscribe((editor) => {
			editor.model.document.on('change:data', throttledEditorChange);
		});

		this.afterAttachToDom.subscribe(() => {
			ClassicEditor.create(textareaElement$._())
			.then((editor) => editor$._(editor))
			.catch((error) => {
				console.error(error);
			});
		});

		return parseHTML([
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
						'<>', '<p><i>Hello</i>, <b>World</b>!', '</>',
					],
					'</textarea>',
				],
				'</div>',
				if_(isSaving$, () => parseHTML([
					'<mark>', ['Auto saving...'], '</mark>',
				]))
				.endIf(),
				'<pre>', {
					style: 'border: 5px solid #ccc; padding: 10px; white-space: normal',
				},
				[editorData$],
				'</pre>',
			],
			'</div>',
		]);
	}
}

mountComponent(new Wysiwyg(), document.getElementById('root'));
