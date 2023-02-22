import createStore from "../lib/js/core/createStore.js";
import map from "../lib/js/core/map.js";
import block from "../lib/js/dom/block.js";
import arrayToVirtualDom from "../lib/js/dom/arrayToVirtualDom.js";
import Component from "../lib/js/dom/Component.js";
import combineNamedStores from "../lib/js/core/combineNamedStores.js";
import flow from "../node_modules/lodash-es/flow.js";
import mount from "../lib/js/dom/mount.js";

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
			const oldValue = inputElement$().value;
			callback();
			const newValue = inputElement$().value;
			if (oldValue !== newValue) {
				hasWiggle$(true);
				setTimeout(() => {
					hasWiggle$(false);
				}, 1000);
			}
		};

		const setSelectedCountryWithWiggle = (country) => {
			selectedCountry$(country);

			wiggleIfValueChanged(activitySelectElement$, activityHasWiggle$, () => {
				const activities = countriesData[country] ?? {};
				activitiesOfSelectedCountry$(Object.keys(activities));
				if (activitiesOfSelectedCountry$().includes(selectedActivity$())) {
					activitySelectElement$().value = selectedActivity$();
				}
			});
			setSelectedActivityWithWiggle(activitySelectElement$().value);
		};

		const setSelectedActivityWithWiggle = (activity) => {
			selectedActivity$(activity);

			wiggleIfValueChanged(placeSelectElement$, placeHasWiggle$, () => {
				const activitiesData = countriesData[selectedCountry$()] ?? {};
				const places = activitiesData[activity] ?? [];
				placesOfSelectedActivity$(places);
				if (placesOfSelectedActivity$().includes(selectedPlace$())) {
					placeSelectElement$().value = selectedPlace$();
				}
			});
			selectedPlace$(placeSelectElement$().value);
		};

		const viewModel = {
			country: selectedCountry$,
			activity: selectedActivity$,
			place: selectedPlace$,
		};

		const normalizedViewModel$ = combineNamedStores(viewModel);

		const formHasError$ = map(normalizedViewModel$, (v) => {
			return ! (v.country && v.activity && v.place);
		});

		return arrayToVirtualDom([
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
								block.forEach(countries, (country) => arrayToVirtualDom([
									'<option>', [country], '</option>',
								])),
							],
							'</select>',
						],
						'</div>',
						'<div>', { class: 'col-lg-4 mb-3'},
						[
							'<label>', { class: 'form-label' }, ['Activity '], '</label>',
							'<select>', {
								name: 'activity',
								class: 'form-control',
								disabled: map(activitiesOfSelectedCountry$, v => !v.length),
								'.wiggle': activityHasWiggle$,
								'<>': activitySelectElement$,
								'@change': flow([
									(ev) => ev.target.value,
									setSelectedActivityWithWiggle,
								]),
							},
							[
								'<option>', { value: '' }, [ 'Select Activity'], '</option>',
								block.forEach(activitiesOfSelectedCountry$, (activity) => arrayToVirtualDom([
									'<option>', [activity], '</option>',
								]))
							],
							'</select>',
						],
						'</div>',
						'<div>', { class: 'col-lg-4 mb-3'},
						[
							'<label>', { class: 'form-label' }, ['Place '], '</label>',
							'<select>', {
								name: 'place',
								class: 'form-control',
								disabled: map(placesOfSelectedActivity$, v => !v.length),
								'.wiggle': placeHasWiggle$,
								'<>': placeSelectElement$,
								'@change': flow([
									(ev) => ev.target.value,
									selectedPlace$,
								]),
							},
							[
								'<option>', { value: '' }, [ 'Select Place'], '</option>',
								block.forEach(placesOfSelectedActivity$, (place) => arrayToVirtualDom([
									'<option>', [place], '</option>',
								])),
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
							disabled: map(combineNamedStores({
								formHasError: formHasError$,
								submitInProgress: submitInProgress$,
							}), (v) => v.formHasError || v.submitInProgress),
						},
						['Submit'],
						'</button>',
					],
					'</div>',
				],
				'</form>',
				'<pre>', { class: 'border border-4 p-3 mt-5' },
				[
					map(normalizedViewModel$, (v) => JSON.stringify(v, null, 2))
				],
				'</pre>',
			],
			'</div>',
		]);
	}
}

mount(new Wiggle(), document.getElementById('root'));
