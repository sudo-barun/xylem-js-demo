import createStore from "../node_modules/@xylem-js/xylem-js/core/createStore.js";
import combineSuppliers from "../node_modules/@xylem-js/xylem-js/core/combineSuppliers.js";
import combineNamedSuppliers from "../node_modules/@xylem-js/xylem-js/core/combineNamedSuppliers.js";
import Component from "../node_modules/@xylem-js/xylem-js/dom/Component.js";
import flow from "../node_modules/lodash-es/flow.js";
import forEach from "../node_modules/@xylem-js/xylem-js/dom/forEach.js";
import map from "../node_modules/@xylem-js/xylem-js/core/map.js";
import mountComponent from "../node_modules/@xylem-js/xylem-js/dom/mountComponent.js";
import parseHTML from "../node_modules/@xylem-js/xylem-js/dom/parseHTML.js";

const countriesData = {
	'Nepal': {
		'Heritage Tour': [ 'Pashupati' ],
		'Trekking': [ 'Everest Base Camp', 'Annapurna Base Camp' ],
		'Easy Trek': [ 'Annapurna Base Camp', 'Langtang' ],
	},
	'India': {
		'Heritage Tour': [ 'Taj Mahal', 'Varanasi' ],
		'Beach party': [ 'Goa' ],
	},
};

class Wiggle extends Component
{
	build()
	{
		const selectedCountry$ = createStore('');
		const selectedActivity$ = createStore('');
		const selectedPlace$ = createStore('');

		const activitySelectElement$ = createStore();
		const placeSelectElement$ = createStore();

		const countries = Object.keys(countriesData);
		const activitiesOfSelectedCountry$ = createStore([]);
		const placesOfSelectedActivity$ = createStore([]);

		const activityHasWiggle$ = createStore(false);
		const placeHasWiggle$ = createStore(false);

		const submitInProgress$ = createStore(false);

		const wiggleIfValueChanged = (inputElement$, hasWiggle$, callback) => {
			const oldValue = inputElement$._().value;
			callback();
			const newValue = inputElement$._().value;
			if (oldValue !== newValue) {
				hasWiggle$._(true);
				setTimeout(() => {
					hasWiggle$._(false);
				}, 1000);
			}
		};

		const setSelectedCountryWithWiggle = (country) => {
			selectedCountry$._(country);

			wiggleIfValueChanged(activitySelectElement$, activityHasWiggle$, () => {
				const activities = countriesData[country] ?? {};
				activitiesOfSelectedCountry$._(Object.keys(activities));
				if (activitiesOfSelectedCountry$._().indexOf(selectedActivity$._()) !== -1) {
					activitySelectElement$._().value = selectedActivity$._();
				}
			});
			setSelectedActivityWithWiggle(activitySelectElement$._().value);
		};

		const setSelectedActivityWithWiggle = (activity) => {
			selectedActivity$._(activity);

			wiggleIfValueChanged(placeSelectElement$, placeHasWiggle$, () => {
				const activitiesData = countriesData[selectedCountry$._()] ?? {};
				const places = activitiesData[activity] ?? [];
				placesOfSelectedActivity$._(places);
				if (placesOfSelectedActivity$._().indexOf(selectedPlace$._()) !== -1) {
					placeSelectElement$._().value = selectedPlace$._();
				}
			});
			selectedPlace$._(placeSelectElement$._().value);
		};

		const viewModel = {
			country: selectedCountry$,
			activity: selectedActivity$,
			place: selectedPlace$,
		};

		const normalizedViewModel$ = combineNamedSuppliers(this, viewModel);

		const formHasError$ = map(this, normalizedViewModel$, (v) => {
			return ! (v.country && v.activity && v.place);
		});

		return parseHTML([
			'<div>', { class: 'container mt-4' },
			[
				'<div>', { class: 'h4' }, ['Travel Destination'], '</div>',
				'<form>',
				[
					'<div>', { class: 'row' },
					[
						'<div>', { class: 'col-lg-4 mb-3'},
						[
							'<label>', { class: 'form-label' }, ['Country '], '</label>',
							'<select>', {
								name: 'country',
								class: 'form-control',
								'@change': flow([
									(ev) => ev.target.value,
									setSelectedCountryWithWiggle,
								]),
							},
							[
								'<option>', { value: '' }, [ 'Select Country'], '</option>',
								forEach(countries, function (country) {
									return parseHTML([
										'<option>', [country], '</option>',
									]);
								}).endForEach(),
							],
							'</select>',
						],
						'</div>',
						'<div>', { class: 'col-lg-4 mb-3'},
						[
							'<label>', { class: 'form-label' }, ['Activity '], '</label>',
							'<select>', {
								name: 'activity',
								class: [ 'form-control', {
									wiggle: activityHasWiggle$,
								}],
								disabled: map(this, activitiesOfSelectedCountry$, v => !v.length),
								'<>': activitySelectElement$,
								'@change': flow([
									(ev) => ev.target.value,
									setSelectedActivityWithWiggle,
								]),
							},
							[
								'<option>', { value: '' }, [ 'Select Activity'], '</option>',
								forEach(activitiesOfSelectedCountry$, function (activity) {
									return parseHTML([
										'<option>', [activity], '</option>',
									]);
								}).endForEach(),
							],
							'</select>',
						],
						'</div>',
						'<div>', { class: 'col-lg-4 mb-3'},
						[
							'<label>', { class: 'form-label' }, ['Place '], '</label>',
							'<select>', {
								name: 'place',
								class: [ 'form-control', {
									wiggle: placeHasWiggle$,
								}],
								disabled: map(this, placesOfSelectedActivity$, v => !v.length),
								'<>': placeSelectElement$,
								'@change': flow([
									(ev) => ev.target.value,
									(v) => selectedPlace$._(v),
								]),
							},
							[
								'<option>', { value: '' }, [ 'Select Place'], '</option>',
								forEach(placesOfSelectedActivity$, function (place) {
									return parseHTML([
										'<option>', [place], '</option>',
									]);
								}).endForEach(),
							],
							'</select>',
						],
						'</div>',
					],
					'</div>',
					'<div>',
					[
						'<button>', {
							type: 'submit',
							class: 'btn btn-primary float-end',
							disabled: map(
								this,
								combineSuppliers(this, [formHasError$, submitInProgress$]),
								([hasError, inProgress]) => hasError || inProgress
							),
						},
						['Submit'],
						'</button>',
					],
					'</div>',
				],
				'</form>',
				'<pre>', { class: 'border border-4 p-3 mt-5' },
				[
					map(this, normalizedViewModel$, (v) => JSON.stringify(v, null, 2))
				],
				'</pre>',
			],
			'</div>',
		]);
	}
}

mountComponent(new Wiggle(), document.getElementById('root'));
