import combineNamedSuppliers from "../node_modules/@xylem-js/xylem-js/core/combineNamedSuppliers.js";
import Component from "../node_modules/@xylem-js/xylem-js/dom/Component.js";
import createArrayStore from "../node_modules/@xylem-js/xylem-js/array/createArrayStore.js";
import createSupplier from "../node_modules/@xylem-js/xylem-js/core/createSupplier.js";
import createStore from "../node_modules/@xylem-js/xylem-js/core/createStore.js";
import createEmittableStream from "../node_modules/@xylem-js/xylem-js/core/createEmittableStream.js";
import curryRight from "../node_modules/lodash-es/curryRight.js";
import FakeLifecycle from "../node_modules/@xylem-js/xylem-js/utilities/FakeLifecycle.js";
import flow from "../node_modules/lodash-es/flow.js";
import forEach from "../node_modules/@xylem-js/xylem-js/dom/forEach.js";
import map from "../node_modules/@xylem-js/xylem-js/core/map.js";
import mountComponent from "../node_modules/@xylem-js/xylem-js/dom/mountComponent.js";
import normalizeArrayStore from "../node_modules/@xylem-js/xylem-js/array/normalizeArrayStore.js";
import parseHTML from "../node_modules/@xylem-js/xylem-js/dom/parseHTML.js";
import push from "../node_modules/@xylem-js/xylem-js/array_action/push.js";
import remove from "../node_modules/@xylem-js/xylem-js/array_action/remove.js";

function isNumericString(str)
{
	return !isNaN(str) && !isNaN(parseFloat(str));
}

function getTableEntry(index)
{
	const productName$ = createStore(`Item ${index + 1}`);
	const quantity$ = createStore('1');
	const rate$ = createStore('');
	const price$ = map(new FakeLifecycle, combineNamedSuppliers(new FakeLifecycle, {
		quantity: quantity$,
		rate: rate$
	}), (v) => isNumericString(v.quantity) && isNumericString(v.rate) ? v.quantity * v.rate : null);

	return {
		productName$,
		quantity$,
		rate$,
		price$,
	};
}

class Invoice extends Component
{
	build()
	{
		const tableData$ = createArrayStore(Array.apply(null, Array(5)).map((_, index) => getTableEntry(index)));

		const normalizedTableData$ = normalizeArrayStore(tableData$, (row) => combineNamedSuppliers(this, {
			productName: row.productName$,
			quantity: row.quantity$,
			rate: row.rate$,
			price: createSupplier(row.price$, createEmittableStream()),
		}));
		const totalPrice$ = map(this, normalizedTableData$, (tableData) => {
			return tableData.reduce((acc, row) => {
				return isNumericString(row.price) ? +acc + +row.price : acc;
			}, null);
		});
		const viewModel = {
		  tableData$: tableData$,
		  totalPrice$: totalPrice$
		};
		console.log('viewModel', viewModel);
		const normalizedModel$ = combineNamedSuppliers(this, {
		  tableData: normalizedTableData$,
		  totalPrice: createSupplier(totalPrice$, createEmittableStream()),
		});
		normalizedModel$.subscribe(v => console.log(v))

		return parseHTML([
			'<div>', { class: 'container mt-3' },
			[
				'<div>', { class: 'row' },
				[
					'<div>', { class: 'col-lg-9' },
					[
						'<h2>', ['Invoice'], '</h2>',
						'<div>', { class: 'table-responsive' },
						[
							'<table>', { class: 'table' },
							[
								'<thead>',
								[
									'<tr>',
									[
										'<th>', ['#'], '</th>',
										'<th>', ['Product Name'], '</th>',
										'<th>', ['Quantity'], '</th>',
										'<th>', ['Rate'], '</th>',
										'<th>', ['Price'], '</th>',
										'<th>', ['Action'], '</th>',
									],
									'</tr>',
								],
								'</thead>',
								'<tbody>',
								[
									forEach(tableData$, function (rowData, index$) {
										const productName$ = rowData.productName$;
										const { quantity$, rate$, price$ } = rowData;
										return parseHTML([
											'<tr>', [
												'<td>',
												[map(this, index$, (v) => v + 1)],
												'</td>',
												'<td>',
												[
													'<input/>', {
														class: 'form-control',
														style: 'min-width: 5em',
														value: productName$._(),
														'@input': flow([
															(ev) => ev.target.value,
															(v) => productName$._(v),
														]),
													},
												],
												'</td>',
												'<td>',
												[
													'<input/>', {
														class: [ 'form-control', {
															'is-invalid': map(this, quantity$, (v) => !isNumericString(v)),
														}],
														style: 'min-width: 5em',
														value: quantity$._(),
														'@input': flow([
															(ev) => ev.target.value,
															(v) => rowData.quantity$._(v),
														]),
													},
												],
												'</td>',
												'<td>',
												[
													'<input/>', {
														class: [ 'form-control', {
															'is-invalid': map(this, rate$, (v) => !isNumericString(v)),
														}],
														style: 'min-width: 5em',
														value: rate$._(),
														'@input': flow([
															(ev) => ev.target.value,
															(v) => rowData.rate$._(v),
														]),
													},
												],
												'</td>',
												'<td>',
												[
													map(this, price$, (p) => p === null ? '–' : p),
												],
												'</td>',
												'<td>',
												[
													'<button>', {
														class: 'btn btn-outline-danger',
														'@click': () => {
															tableData$.mutate(remove, index$);
														}
													},
													['Remove'],
													'</button>',
												],
												'</td>',
											],
											'</tr>',
										]);
									})
									.endForEach(),
								],
								'</tbody>',
								'<tfoot>',
								[
									'<tr>',
									[
										'<th>', {
											colspan: 4,
											"class": 'text-end'
										},
										['Total Price ='],
										'</th>',
										'<th>',
										[
											map(this, totalPrice$, (p) => p === null ? '' : p),
										],
										'</th>',
										'<td>', {
											style: 'text-align: center'
										},
										[
											'<button>', {
												class: 'btn btn-outline-primary',
												'@click': () => {
													tableData$.mutate(push, getTableEntry(tableData$._().length));
												},
											},
											['Add'],
											'</button>',
										],
										'</td>',
									],
									'</tr>',
								],
								'</tfoot>',
							],
							'</table>',
						],
						'</div>',
					],
					'</div>',
					'<div>', { class: 'col-lg-3' },
					[
						'<pre>', {
							style: 'border: 1px solid #ccc; padding: 20px',
						},
						[map(this, normalizedModel$, curryRight(JSON.stringify)(null, 2))],
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

mountComponent(new Invoice(), document.getElementById('root'));
