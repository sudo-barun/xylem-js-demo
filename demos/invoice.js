import combineNamedSuppliers from "../lib/js/core/combineNamedSuppliers.js";
import Component from "../lib/js/dom/Component.js";
import createArrayStore from "../lib/js/array/createArrayStore.js";
import createSupplier from "../lib/js/core/createSupplier.js";
import createStore from "../lib/js/core/createStore.js";
import createEmittableStream from "../lib/js/core/createEmittableStream.js";
import curryRight from "../node_modules/lodash-es/curryRight.js";
import flow from "../node_modules/lodash-es/flow.js";
import forEach from "../lib/js/dom/forEach.js";
import map from "../lib/js/core/map.js";
import mountComponent from "../lib/js/dom/mountComponent.js";
import normalizeArrayStore from "../lib/js/array/normalizeArrayStore.js";
import parseHTML from "../lib/js/dom/parseHTML.js";
import push from "../lib/js/array_action/push.js";
import remove from "../lib/js/array_action/remove.js";

function isNumericString(str)
{
	return !isNaN(str) && !isNaN(parseFloat(str));
}

function getTableEntry(index)
{
	const productName$ = createStore(`Item ${index + 1}`);
	const quantity$ = createStore('1');
	const rate$ = createStore('');
	const price$ = map(combineNamedSuppliers({
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

		const normalizedTableData$ = normalizeArrayStore(tableData$, (row) => combineNamedSuppliers({
			productName: row.productName$,
			quantity: row.quantity$,
			rate: row.rate$,
			price: createSupplier(row.price$, createEmittableStream()),
		}));
		const totalPrice$ = map(normalizedTableData$, (tableData) => {
			return tableData.reduce((acc, row) => {
				return isNumericString(row.price) ? +acc + +row.price : acc;
			}, null);
		});
		const viewModel = {
		  tableData$: tableData$,
		  totalPrice$: totalPrice$
		};
		console.log('viewModel', viewModel);
		const normalizedModel$ = combineNamedSuppliers({
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
									forEach(tableData$, (rowData, index$) => {
										const productName$ = rowData.productName$;
										const quantity$ = this.bindSupplier(rowData.quantity$);
										const rate$ = this.bindSupplier(rowData.rate$);
										const price$ = this.bindSupplier(rowData.price$);
										return parseHTML([
											'<tr>', [
												'<td>',
												[map(index$, (v) => v + 1)],
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
															'is-invalid': map(quantity$, (v) => !isNumericString(v)),
														}],
														style: 'min-width: 5em',
														value: quantity$._(),
														'@input': flow([
															(ev) => ev.target.value,
															(v) => quantity$._(v),
														]),
													},
												],
												'</td>',
												'<td>',
												[
													'<input/>', {
														class: [ 'form-control', {
															'is-invalid': map(rate$, (v) => !isNumericString(v)),
														}],
														style: 'min-width: 5em',
														value: rate$._(),
														'@input': flow([
															(ev) => ev.target.value,
															(v) => rate$._(v),
														]),
													},
												],
												'</td>',
												'<td>',
												[
													map(price$, (p) => p === null ? '–' : p),
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
											map(totalPrice$, (p) => p === null ? '' : p),
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
						[map(normalizedModel$, curryRight(JSON.stringify)(null, 2))],
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
