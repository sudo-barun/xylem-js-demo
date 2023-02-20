import arrayToVirtualDom from "../lib/js/dom/arrayToVirtualDom.js";
import block from "../lib/js/dom/block.js";
import Component from "../lib/js/dom/Component.js";
import createArrayStore from "../lib/js/core/createArrayStore.js";
import createStore from "../lib/js/core/createStore.js";
import deriveStoreFromObject from "../lib/js/core/deriveStoreFromObject.js";
import flow from "../node_modules/lodash-es/flow.js";
import curryRight from "../node_modules/lodash-es/curryRight.js";
import map from "../lib/js/core/map.js";
import mount from "../lib/js/dom/mount.js";
import normalizeArrayStore from "../lib/js/core/normalizeArrayStore.js";
import push from "../lib/js/core/push.js";
import splice from "../lib/js/core/splice.js";

function isNumericString(str)
{
	return !isNaN(str) && !isNaN(parseFloat(str));
}

function getTableEntry(index)
{
	const productName$ = createStore(`Item ${index + 1}`);
	const quantity$ = createStore('1');
	const rate$ = createStore('');
	const price$ = map(deriveStoreFromObject({
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
		const tableData$ = createArrayStore(Array(5).fill().map((_, index) => getTableEntry(index)));

		const normalizedTableData$ = normalizeArrayStore(tableData$, (row) => deriveStoreFromObject({
			productName: row.productName$,
			quantity: row.quantity$,
			rate: row.rate$,
			price: row.price$
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
		const normalizedModel$ = deriveStoreFromObject({
		  tableData: normalizedTableData$,
		  totalPrice: totalPrice$
		});

		return arrayToVirtualDom([
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
									block.forEach(tableData$, (rowData, index$) => arrayToVirtualDom([
										'<tr>', [
											'<td>',
											[map(index$, (v) => v + 1)],
											'</td>',
											'<td>',
											[
												'<input>', {
													class: 'form-control',
													style: 'min-width: 5em',
													value: rowData.productName$(),
													'@input': flow([
														(ev) => ev.target.value,
														rowData.productName$,
													]),
												},
											],
											'</td>',
											'<td>',
											[
												'<input>', {
													class: 'form-control',
													style: 'min-width: 5em',
													'.is-invalid': map(rowData.quantity$, (v) => !isNumericString(v)),
													value: rowData.quantity$(),
													'@input': flow([
														(ev) => ev.target.value,
														rowData.quantity$,
													]),
												},
											],
											'</td>',
											'<td>',
											[
												'<input>', {
													class: 'form-control',
													style: 'min-width: 5em',
													'.is-invalid': map(rowData.rate$, (v) => !isNumericString(v)),
													value: rowData.rate$(),
													'@input': flow([
														(ev) => ev.target.value,
														rowData.rate$,
													]),
												},
											],
											'</td>',
											'<td>',
											[
												map(rowData.price$, (p) => p === null ? '–' : p),
											],
											'</td>',
											'<td>',
											[
												'<button>', {
													class: 'btn btn-outline-danger',
													'@click': () => {
														tableData$.mutate(splice, undefined, index$);
													}
												},
												['Remove'],
												'</button>',
											],
											'</td>',
										],
										'</tr>',
									]))
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
													tableData$.mutate(push, getTableEntry(tableData$().length));
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

mount(new Invoice(), document.getElementById('root'));