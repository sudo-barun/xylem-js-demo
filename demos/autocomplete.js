import axios from "../node_modules/axios/dist/esm/axios.js";
import Component from "../lib/js/dom/Component.js";
import createStore from "../lib/js/core/createStore.js";
import curryRight from "../node_modules/lodash-es/curryRight.js";
import flow from "../node_modules/lodash-es/flow.js";
import if_ from "../lib/js/dom/if_.js";
import mountComponent from "../lib/js/dom/mountComponent.js";
import map from "../lib/js/core/map.js";
import parseHTML from "../lib/js/dom/parseHTML.js";
import cumulate from "../lib/js/core/cumulate.js";

const allNames$ = getAllNames$();

function getAllNames$()
{
	const allNames$ = createStore([]);

	axios.get('autocomplete.json')
	.then((res) =>res.data)
	.then(allNames$);

	return allNames$;
}

function getSuggestions(input)
{
	return new Promise((resolve) => {
		setTimeout(() => {
			input = input.trim();
			const suggestions = input ? allNames$().filter((name) => name.includes(input)) : [];
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
			inputValue$,
			(value) => {
				inputElement$().value = value;
				inputElement$().focus();
				$(inputElement$()).autocomplete('search');
				return value;
			},
		]);

		this.afterAttachToDom.subscribe(() => {
			$(inputElement$()).autocomplete({
				source: (request, response) => {
					getSuggestions(request.term).then(response);
				},
				delay: 500,
				search: () => isSearching$(true),
				response: () => isSearching$(false),
				select: (_, ui) => inputValue$(ui.item.value),
			});
		});

		this.beforeDetachFromDom.subscribe(() => {
			$(inputElement$()).autocomplete('destroy');
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
							inputValue$,
						]),
						'<>': inputElement$,
					},
					' ',
					if_(isSearching$, () => parseHTML([
						'<mark>',
						['searching...'],
						'</mark>',
					]))
					.endIf(),
				],
				'</label>',
				'<pre>',
				[
					map(inputValue$, curryRight(JSON.stringify)(null, 2)),
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
			if_(isDisplayed$, () => parseHTML([
				new Autocomplete(),
			]))
			.endIf(),
			'<div>', { class: 'container' },
			[
				'<button>', {
					'@click': () => cumulate(isDisplayed$, (v) => !v),
				},
				[
					map(isDisplayed$, (v) => v ? 'Destroy' : 'Create'),
				],
				'</button>',
			],
			'</div>',
		]);
	}
}

mountComponent(new Root(), document.getElementById('root'));
