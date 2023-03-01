import arrayToVirtualDom from "../lib/js/dom/arrayToVirtualDom.js";
import combineNamedStores from "../lib/js/core/combineNamedStores.js";
import Component from "../lib/js/dom/Component.js";
import createStore from "../lib/js/core/createStore.js";
import forEach from "../lib/js/dom/forEach.js";
import map from "../lib/js/core/map.js";
import mount from "../lib/js/dom/mount.js";

class Form extends Component
{
	build(attrs)
	{
		const data = attrs.formData$();

		const inputValue$ = createStore(data.input);
		const textareaValue$ = createStore(data.textarea);
		const singleSelectSelected$ = createStore(data.singleSelect);
		const multiSelectSelected$ = createStore(data.multiSelect);
		const singleCheckboxChecked$ = createStore(data.singleCheckbox);
		const multiCheckboxChecked$s = {
			'1': createStore(data.multiCheckbox.includes('1')),
			'2': createStore(data.multiCheckbox.includes('2')),
			'3': createStore(data.multiCheckbox.includes('3')),
		};
		const radioChecked$ = createStore(data.radio);
		const isSubmitting$ = createStore(false);

		const selectedMultiCheckboxes$ = map(
			combineNamedStores(multiCheckboxChecked$s),
			(values) => Object.keys(values).reduce((acc, key) => {
				if (values[key]) {
					acc.push(key);
				}
				return acc;
			}, [])
		);
		const formData$ = combineNamedStores({
			input: inputValue$,
			textarea: textareaValue$,
			singleSelect: singleSelectSelected$,
			multiSelect: multiSelectSelected$,
			singleCheckbox: singleCheckboxChecked$,
			multiCheckbox: selectedMultiCheckboxes$,
			radio: radioChecked$,
		});

		attrs.formData$(formData$());
		formData$.subscribe(attrs.formData$);

		return arrayToVirtualDom([
			'<form>', {
				'@submit': (ev) => {
					ev.preventDefault();
					isSubmitting$(true);
					attrs.onSubmit().finally(() => isSubmitting$(false));
				},
			},
			[
				'<div>', { class: 'mb-3' },
				[
					'<label>', {
						for: 'input',
						class: 'form-label',
					},
					[ 'Input' ],
					'</label>',
					'<input/>', {
						id: 'input',
						class: 'form-control',
						value: inputValue$(),
						'@input': (ev) => inputValue$(ev.target.value),
					},
				],
				'</div>',
				'<div>', { class: 'mb-3' },
				[
					'<label>', {
						for: 'textarea',
						class: 'form-label',
					},
					[ 'Textarea' ],
					'</label>',
					'<textarea>', {
						id: 'textarea',
						class: 'form-control',
						'@input': (ev) => textareaValue$(ev.target.value),
					},
					[ textareaValue$() ],
					'</textarea>',
				],
				'</div>',
				'<div>', { class: 'mb-3' },
				[
					'<label>', {
						for: 'single-select',
						class: 'form-label',
					},
					[ 'Single select' ],
					'</label>',
					'<select>', {
						id: 'single-select',
						class: 'form-control',
						'@change': (ev) => singleSelectSelected$(ev.target.value),
					},
					[
						forEach([
							{ value: '', text: '-- None selected --' },
							{ value: '1', text: 'One' },
							{ value: '2', text: 'Two' },
							{ value: '3', text: 'Three' }
						], ({ value, text }) => arrayToVirtualDom([
							'<option>', {
								value,
								selected: singleSelectSelected$() === value,
							},
							[ text ],
							'</option>',
						]))
						.endForEach(),
					],
					'</select>',
				],
				'</div>',
				'<div>', { class: 'mb-3' },
				[
					'<label>', {
						for: 'multi-select',
						class: 'form-label',
					},
					[ 'Multi select' ],
					'</label>',
					'<select>', {
						multiple: '',
						id: 'multi-select',
						class: 'form-control',
						'@change': (ev) => {
							const checkedOptions = ev.target.querySelectorAll('option:checked');
							const value = Array.from(checkedOptions, e => e.value);
							multiSelectSelected$(value);
						},
					},
					[
						forEach([
							{ value: '1', text: 'One' },
							{ value: '2', text: 'Two' },
							{ value: '3', text: 'Three' }
						], ({ value, text }) => arrayToVirtualDom([
							'<option>', {
								value,
								selected: multiSelectSelected$().includes(value),
							},
							[ text ],
							'</option>',
						]))
						.endForEach(),
					],
					'</select>',
				],
				'</div>',
				'<div>', { class: 'mb-3' },
				[
					'<div>', { class: 'form-label' },
					[ 'Single checkbox' ],
					'</div>',
					'<div>', { class: 'form-check' },
					[
						'<input/>', {
							type: 'checkbox',
							id: 'single-checkbox',
							class: 'form-check-input',
							checked: singleCheckboxChecked$(),
							'@change': (ev) => singleCheckboxChecked$(ev.target.checked),
						},
						'<label>', {
							for: 'single-checkbox',
						},
						[ 'Checkbox' ],
						'</label>',
					],
					'</div>',
				],
				'</div>',
				'<div>', { class: 'mb-3' },
				[
					'<div>', { class: 'form-label' },
					[ 'Multiple checkboxes' ],
					'</div>',
					'<div>',
					[
						forEach([
							{ value: '1', text: 'One' },
							{ value: '2', text: 'Two' },
							{ value: '3', text: 'Three' }
						], ({ value, text }, index$) => arrayToVirtualDom([
							'<div>', { class: 'form-check form-check-inline' },
							[
								'<input/>', {
									type: 'checkbox',
									id: `checkbox-${index$()}`,
									class: 'form-check-input',
									checked: multiCheckboxChecked$s[value](),
									value,
									'@change': (ev) => multiCheckboxChecked$s[value](ev.target.checked),
								},
								'<label>', {
									for: `checkbox-${index$()}`,
								},
								[ text ],
								'</label>',
							],
							'</div>',
						]))
						.endForEach(),
					],
					'</div>',
				],
				'</div>',
				'<div>', { class: 'mb-3' },
				[
					'<div>', { class: 'form-label' },
					[ 'Radios' ],
					'</div>',
					'<div>',
					[
						forEach([
							{ value: '', text: '-- None --' },
							{ value: '1', text: 'One' },
							{ value: '2', text: 'Two' },
							{ value: '3', text: 'Three' }
						], ({ value, text }, index$) => arrayToVirtualDom([
							'<div>', { class: 'form-check form-check-inline' },
							[
								'<input/>', {
									type: 'radio',
									name: 'number',
									id: `radio-${index$()}`,
									class: 'form-check-input',
									checked: value === radioChecked$(),
									value,
									'@change': () => radioChecked$(value),
								},
								'<label>', {
									for: `radio-${index$()}`,
								},
								[ text ],
								'</label>',
							],
							'</div>',
						]))
						.endForEach(),
					],
					'</div>',
				],
				'</div>',
				'<button>', {
					type: 'submit',
					class: 'btn btn-primary',
					disabled: isSubmitting$,
				},
				[
					map(isSubmitting$, v => v ? 'Submitting...' : 'Submit'),
				],
				'</button>',
			],
			'</form>',
		]);
	}
}

class App extends Component
{
	build()
	{
		let formData$ = createStore({
			input: 'single-line text',
			textarea: 'multi-line text',
			singleCheckbox: true,
			multiCheckbox: ['2'],
			singleSelect: '1',
			multiSelect: ['1','2'],
			radio: '3',
		});

		return arrayToVirtualDom([
			'<div>', { class: 'container mt-4' },
			[
				'<div>', { class: 'row' },
				[
					'<div>', { class: 'col-lg-7 col-xl-8 mb-4' },
					[
						'<h1>', [ 'Form' ], '</h1>',
						new Form({
							formData$,
							onSubmit: () => {
								return new Promise((res) => {
									console.log('using form data');
									console.log(formData$());
									setTimeout(() => res(), 1000);
								});
							},
						}),
					],
					'</div>',
					'<div>', { class: 'col-lg-5 col-xl-4 mb-4' },
					[
						'<pre>', {
							style: 'border: 1px solid #ccc; padding: 20px',
						},
						[
							map(formData$, v => JSON.stringify(v, null, 4)),
						],
						'</pre>',
					],
					'</div>',
				],
				'</div>',
			],
			'</div>',
		]);
	}
}

mount(new App(), document.getElementById('app-container'));
