import "../lib/js/array/registerRemove.js";
import "../lib/js/array/registerUnshift.js";
import Component from "../lib/js/dom/Component.js";
import createArrayStore from "../lib/js/array/createArrayStore.js";
import createStore from "../lib/js/core/createStore.js";
import combineNamedDataNodes from "../lib/js/core/combineNamedDataNodes.js";
import forEach from "../lib/js/dom/forEach.js";
import GoToTop from "./components/GoToTop.js";
import if_ from "../lib/js/dom/if_.js";
import map from "../lib/js/core/map.js";
import mountComponent from "../lib/js/dom/mountComponent.js";
import normalizeArrayStore from "../lib/js/array/normalizeArrayStore.js";
import parseHTML from "../lib/js/dom/parseHTML.js";
import remove from "../lib/js/array/remove.js";
import unshift from "../lib/js/array/unshift.js";

function intersperse(array, itemToInsert)
{
	const loopCount = array.length - 1;
	for (let i = 0; i < loopCount; i++) {
		array.splice(2 * i + 1, 0, itemToInsert);
	}
	return array;
}
console.log(intersperse([1, 2, 3, 4, 5], {}));

function getTodoListItem(index)
{
	return {
		text: `Item ${index + 1}`,
		isCompleted$: createStore(false),
	};
}

function getTodoList(count)
{
	return Array.apply(null, Array(count)).map((_, i) => getTodoListItem(i));
}

function truncateTodos(todos, total)
{
	if (todos.length > total) {
		const removeCount = todos.length - total;
		todos = todos.slice(0, total);
		todos.push(`${removeCount} items has been excluded.`);
		return todos;
	}
	return todos;
}

class TodoComponent extends Component
{
	build()
	{
		const todos$ = createArrayStore(getTodoList(10));
		const newTodo$ = createStore('');
		const inputElement$ = createStore();

		function fillTodoList(count) {
			todos$._(getTodoList(count));
		}

		const normalizedTodos$ = normalizeArrayStore(todos$, (todo) => combineNamedDataNodes({
			text: createStore(todo.text),
			isCompleted: todo.isCompleted$
		}));

		const normalizedModel$ = combineNamedDataNodes({
			newTodo: newTodo$,
			todos: normalizedTodos$
		});

		const viewModel = {
			todos$: todos$,
			newTodo$: newTodo$,
		};
		console.log('viewModel', viewModel);

		window.todos$ = todos$;

		return parseHTML([
			'<div>', { class: 'container mt-4 mb-5' },
			[
				'<div>', { class: 'row' },
				[
					'<div>', { class: 'col-xxl-10 mx-auto' },
					[
						'<div>', { class: 'row' },
						[
							'<div>', { "class": 'col-lg-8' },
							[
								'<h2>', ['To-do list'], '</h2>',
								'<div>', { class: 'mb-4' },
								[
									'Reset to-do list with ',
									...intersperse([0, 5, 10, 50, 100, 500, 1000, 5000, 10000].map((count) => [
										'<button>', {
											class: 'btn btn-sm btn-outline-secondary',
											'@click': () => fillTodoList(count),
										},
										[count],
										'</button>',
									]), ' ').reduce((acc, item) => {
										acc.push(...item);
										return acc;
									}, []),
									' items',
								],
								'</div>',
								'<div>', { class: 'row' },
								[
									'<div>', { class: 'col-md'},
									[
										'<form>', {
											class: 'input-group mb-3 w-75 mx-auto',
											'@submit': (ev) => {
												ev.preventDefault();
												todos$.mutate(unshift, {
													text: newTodo$._().trim(),
													isCompleted$: createStore(false)
												});
												newTodo$._('');
												inputElement$._().value = '';
											},
										},
										[
											'<input/>', {
												class: 'form-control',
												'<>': inputElement$,
												'@input': (ev) => newTodo$._(ev.target.value),
											},
											'<button>', {
												type: 'submit',
												class: 'btn btn-outline-secondary',
												disabled: map(newTodo$, (v) => v.trim() === ''),
											},
											['Add'],
											'</button>',
										],
										'</form>'],
									'</div>',
									'<div>', { class: 'col-md-auto' },
									[
										'<button>', {
											class: 'btn btn-outline-danger float-end',
											disabled: map(normalizedTodos$, (todos) => {
												return !todos.some((todo) => todo.isCompleted);
											}),
											'@click': () => {
												const index$Array = todos$.index$Array.filter((index$) => {
													return todos$._()[index$._()].isCompleted$._();
												});
												index$Array.slice().reverse().forEach((index$) => {
													todos$.mutate(remove, index$);
												});
											}
										},
										['Remove completed'],
										'</button>',
									],
									'</div>',
								],
								'</div>',
								'<div>',
								[
									'<b>', ['Total: '], '</b>',
									todos$.length$,
								],
								'</div>',
								if_(todos$.length$, () => parseHTML([
									'<div>', { class: 'list-group' },
									[
										forEach(todos$, (todo, index$) => parseHTML([
											'<div>', { class: 'list-group-item' },
											[
												'<input/>', {
													type: 'checkbox',
													class: 'form-check-input',
													id: map(index$, (v) => `todo-item-${v}`),
													checked: todo.isCompleted$,
													'@change': (ev) => {
														todo.isCompleted$._(ev.target.checked);
													}
												},
												' ',
												'<label>', {
													for: map(index$, (v) => `todo-item-${v}`),
													class: [ 'form-check-label', {
														'text-muted': todo.isCompleted$,
														'text-decoration-line-through': todo.isCompleted$,
													}],
												},
												[todo.text],
												'</label>',
												'<button>', {
													class: 'btn btn-sm btn-outline-danger float-end',
													'@click': () => {
														return todos$.mutate(remove, index$);
													}
												},
												['Remove'],
												'</button>',
											],
											'</div>',
										]))
										.endForEach(),
									],
									'</div>',
								]))
								.else(() => parseHTML([
									'<div>', { class: 'text-secondary text-center' },
									['The todo list is empty.'],
									'</div>',
								]))
								.endIf(),
							],
							'</div>',
							'<div>', { class: 'col-lg-4' },
							[
								'<h5>', ['Data'], '</h5>',
								'<pre>', {
									style: 'border: 1px solid #ccc; padding: 20px'
								},
								[
									'<code>',
									[
										map(normalizedModel$, (v) => JSON.stringify(
											{
												...v,
												...{ todos: truncateTodos(v.todos, 20) }
											}, null, 2
										)),
									],
									'</code>',
								],
								'</pre>',
							],
							'</div>',
						],
						'</div>',
					],
					'</div>',
				], '</div>',
			],
			'</div>',
			new GoToTop(),
		]);
	}
}

const cmp = new TodoComponent();
mountComponent(cmp, document.getElementById('root'));
console.log(cmp)
