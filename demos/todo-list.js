import Component from "../node_modules/@xylem-js/xylem-js/dom/Component.js";
import createArrayStore from "../node_modules/@xylem-js/xylem-js/array/createArrayStore.js";
import createStore from "../node_modules/@xylem-js/xylem-js/core/createStore.js";
import combineNamed from "../node_modules/@xylem-js/xylem-js/core/combineNamed.js";
import forEach from "../node_modules/@xylem-js/xylem-js/dom/forEach.js";
import GoToTop from "./components/GoToTop.js";
import if_ from "../node_modules/@xylem-js/xylem-js/dom/if_.js";
import map from "../node_modules/@xylem-js/xylem-js/core/map.js";
import mountComponent from "../node_modules/@xylem-js/xylem-js/dom/mountComponent.js";
import normalizeArrayStore from "../node_modules/@xylem-js/xylem-js/array/normalizeArrayStore.js";
import parseHTML from "../node_modules/@xylem-js/xylem-js/dom/parseHTML.js";
import remove from "../node_modules/@xylem-js/xylem-js/array_action/remove.js";
import unshift from "../node_modules/@xylem-js/xylem-js/array_action/unshift.js";

function intersperse(array, itemToInsert)
{
	const loopCount = array.length - 1;
	for (let i = 0; i < loopCount; i++) {
		array.splice(2 * i + 1, 0, itemToInsert);
	}
	return array;
}
// console.log(intersperse([1, 2, 3, 4, 5], {}));

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

		const normalizedTodos$ = normalizeArrayStore(todos$, (todo) => combineNamed(this, {
			text: createStore(todo.text),
			isCompleted: todo.isCompleted$
		}));

		const normalizedModel$ = combineNamed(this, {
			newTodo: newTodo$,
			todos: normalizedTodos$
		});

		const viewModel = {
			todos$: todos$,
			newTodo$: newTodo$,
		};
		// console.log('viewModel', viewModel);

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
												disabled: map(this, newTodo$, (v) => v.trim() === ''),
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
											disabled: map(this, normalizedTodos$, (todos) => {
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
								if_(todos$.length$, function () {
									return parseHTML([
										'<div>', { class: 'list-group' },
										[
											forEach(todos$, function (todo, index$) {
												const isCompleted$ = todo.isCompleted$;
												return parseHTML([
													'<div>', { class: 'list-group-item' },
													[
														'<input/>', {
															type: 'checkbox',
															class: 'form-check-input',
															id: map(this, index$, (v) => `todo-item-${v}`),
															checked: isCompleted$,
															'@change': (ev) => {
																todo.isCompleted$._(ev.target.checked);
															}
														},
														' ',
														'<label>', {
															for: map(this, index$, (v) => `todo-item-${v}`),
															class: [ 'form-check-label', {
																'text-muted': isCompleted$,
																'text-decoration-line-through': isCompleted$,
															}],
														},
														[todo.text],
														'</label>',
														'<button>', {
															class: 'btn btn-sm btn-outline-danger float-end',
															'@click': () => {
																todos$.mutate(remove, index$);
															}
														},
														['Remove'],
														'</button>',
													],
													'</div>',
												]);
											})
											.endForEach(),
										],
										'</div>',
									]);
								})
								.else(function () {
									return parseHTML([
										'<div>', { class: 'text-secondary text-center' },
										['The todo list is empty.'],
										'</div>',
									]);
								})
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
										map(this, normalizedModel$, (v) => JSON.stringify(
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
// console.log(cmp)
