import axios from "../node_modules/axios/dist/esm/axios.js";
import Component from "../node_modules/@xylem-js/xylem-js/dom/Component.js";
import createStore from "../node_modules/@xylem-js/xylem-js/core/createStore.js";
import curryRight from "../node_modules/lodash-es/curryRight.js";
import flow from "../node_modules/lodash-es/flow.js";
import if_ from "../node_modules/@xylem-js/xylem-js/dom/if_.js";
import mountComponent from "../node_modules/@xylem-js/xylem-js/dom/mountComponent.js";
import map from "../node_modules/@xylem-js/xylem-js/core/map.js";
import parseHTML from "../node_modules/@xylem-js/xylem-js/dom/parseHTML.js";
import cumulate from "../node_modules/@xylem-js/xylem-js/core/cumulate.js";

const allNames$ = getAllNames$();

function getAllNames$()
{
	const allNames$ = createStore([]);

	axios.get('autocomplete.json')
	.then((res) =>res.data)
	.then((v) => allNames$._(v));

	return allNames$;
}

function getSuggestions(input)
{
	return new Promise((resolve) => {
		setTimeout(() => {
			input = input.trim();
			const suggestions = input ? allNames$._().filter((name) => name.includes(input)) : [];
			resolve(suggestions);
		}, 1000);
	});
}

class Autocomplete extends Component
{
	build()
	{
		const inputValue$ = createStore('');
		const isSearching$ = createStore(false);
		const inputElement$ = createStore();

		const fillInput = flow([
			(v) => inputValue$._(v),
			(value) => {
				inputElement$._().value = value;
				inputElement$._().focus();
				$(inputElement$._()).autocomplete('search');
				return value;
			},
		]);

		this.afterAttachToDom.subscribe(() => {
			$(inputElement$._()).autocomplete({
				source: (request, response) => {
					getSuggestions(request.term).then(response);
				},
				delay: 500,
				search: () => isSearching$._(true),
				response: () => isSearching$._(false),
				select: (_, ui) => inputValue$._(ui.item.value),
			});
		});

		this.beforeDetachFromDom.subscribe(() => {
			$(inputElement$._()).autocomplete('destroy');
		});

		return parseHTML([
			'<div>', {
				class: 'container',
				style: 'margin-top: 16px;'
			},
			[
				'<h2>', ['Autocomplete'], '</h2>',
				'<p>', ['Type some letters to get hints of names.'], '</p>',
				'<p>',
				[
					'Try: ',
					'<button>', {
						'disabled': isSearching$,
						'@click': () => fillInput('Sam'),
					},
					['Sam'],
					'</button>',
					' ',
					'<button>', {
						'disabled': isSearching$,
						'@click': () => fillInput('Barb')
					},
					['Barb'],
					'</button>',
					' ',
					'<button>', {
						'disabled': isSearching$,
						'@click': () => fillInput('Ale'),
					},
					['Ale'],
					'</button>',
				],
				'</p>',
				'<label>',
				[
					'Name: ',
					'<input/>', {
						style: 'font-size: 1.25em',
						'@input': flow([
							(ev) => ev.target.value,
							(v) => inputValue$._(v),
						]),
						'<>': inputElement$,
					},
					' ',
					if_(isSearching$, function () {
						return parseHTML([
							'<mark>',
							['searching...'],
							'</mark>',
						]);
					})
					.endIf(),
				],
				'</label>',
				'<pre>',
				[
					map(this, inputValue$, curryRight(JSON.stringify)(null, 2)),
				],
				'</pre>',
			],
			'</div>',
		]);
	}
}

class Root extends Component
{
	build()
	{
		const isDisplayed$ = createStore(true);

		return parseHTML([
			if_(isDisplayed$, function () {
				return parseHTML([
					new Autocomplete(),
				]);
			})
			.endIf(),
			'<div>', { class: 'container' },
			[
				'<button>', {
					'@click': () => cumulate(isDisplayed$, (v) => !v),
				},
				[
					map(this, isDisplayed$, (v) => v ? 'Destroy' : 'Create'),
				],
				'</button>',
			],
			'</div>',
		]);
	}
}

mountComponent(new Root(), document.getElementById('root'));
