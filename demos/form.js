import parseHTML from "../node_modules/@xylem-js/xylem-js/js/dom/parseHTML.js";
import combineNamedSuppliers from "../node_modules/@xylem-js/xylem-js/js/core/combineNamedSuppliers.js";
import Component from "../node_modules/@xylem-js/xylem-js/js/dom/Component.js";
import createStore from "../node_modules/@xylem-js/xylem-js/js/core/createStore.js";
import forEach from "../node_modules/@xylem-js/xylem-js/js/dom/forEach.js";
import map from "../node_modules/@xylem-js/xylem-js/js/core/map.js";
import mountComponent from "../node_modules/@xylem-js/xylem-js/js/dom/mountComponent.js";

class Form extends Component
{
	build(attrs)
	{
		const data = attrs.formData$._();

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
			combineNamedSuppliers(multiCheckboxChecked$s),
			(values) => Object.keys(values).reduce((acc, key) => {
				if (values[key]) {
					acc.push(key);
				}
				return acc;
			}, [])
		);
		const formData$ = combineNamedSuppliers({
			input: inputValue$,
			textarea: textareaValue$,
			singleSelect: singleSelectSelected$,
			multiSelect: multiSelectSelected$,
			singleCheckbox: singleCheckboxChecked$,
			multiCheckbox: selectedMultiCheckboxes$,
			radio: radioChecked$,
		});

		formData$.subscribe(attrs.formData$);

		return parseHTML([
			'<form>', {
				'@submit': (ev) => {
					ev.preventDefault();
					isSubmitting$._(true);
					attrs.onSubmit().finally(() => isSubmitting$._(false));
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
						value: inputValue$._(),
						'@input': (ev) => inputValue$._(ev.target.value),
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
						'@input': (ev) => textareaValue$._(ev.target.value),
					},
					[ textareaValue$._() ],
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
						'@change': (ev) => singleSelectSelected$._(ev.target.value),
					},
					[
						forEach([
							{ value: '', text: '-- None selected --' },
							{ value: '1', text: 'One' },
							{ value: '2', text: 'Two' },
							{ value: '3', text: 'Three' }
						], ({ value, text }) => parseHTML([
							'<option>', {
								value,
								selected: singleSelectSelected$._() === value,
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
							multiSelectSelected$._(value);
						},
					},
					[
						forEach([
							{ value: '1', text: 'One' },
							{ value: '2', text: 'Two' },
							{ value: '3', text: 'Three' }
						], ({ value, text }) => parseHTML([
							'<option>', {
								value,
								selected: multiSelectSelected$._().includes(value),
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
							checked: singleCheckboxChecked$._(),
							'@change': (ev) => singleCheckboxChecked$._(ev.target.checked),
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
						], ({ value, text }, index$) => parseHTML([
							'<div>', { class: 'form-check form-check-inline' },
							[
								'<input/>', {
									type: 'checkbox',
									id: `checkbox-${index$._()}`,
									class: 'form-check-input',
									checked: multiCheckboxChecked$s[value]._(),
									value,
									'@change': (ev) => multiCheckboxChecked$s[value]._(ev.target.checked),
								},
								'<label>', {
									for: `checkbox-${index$._()}`,
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
						], ({ value, text }, index$) => parseHTML([
							'<div>', { class: 'form-check form-check-inline' },
							[
								'<input/>', {
									type: 'radio',
									name: 'number',
									id: `radio-${index$._()}`,
									class: 'form-check-input',
									checked: value === radioChecked$._(),
									value,
									'@change': () => radioChecked$._(value),
								},
								'<label>', {
									for: `radio-${index$._()}`,
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
			singleSelect: '1',
			multiSelect: ['1','2'],
			singleCheckbox: true,
			multiCheckbox: ['2'],
			radio: '3',
		});

		return parseHTML([
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
									console.log(formData$._());
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

mountComponent(new App(), document.getElementById('app-container'));
