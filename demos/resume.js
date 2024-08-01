import Component from "../node_modules/@xylem-js/xylem-js/js/dom/Component.js";
import createArrayStore from "../node_modules/@xylem-js/xylem-js/js/array/createArrayStore.js";
import createStore from "../node_modules/@xylem-js/xylem-js/js/core/createStore.js";
import combineSuppliers from "../node_modules/@xylem-js/xylem-js/js/core/combineSuppliers.js";
import combineNamedSuppliers from "../node_modules/@xylem-js/xylem-js/js/core/combineNamedSuppliers.js";
import flow from "../node_modules/lodash-es/flow.js";
import forEach from "../node_modules/@xylem-js/xylem-js/js/dom/forEach.js";
import if_ from "../node_modules/@xylem-js/xylem-js/js/dom/if_.js";
import map from "../node_modules/@xylem-js/xylem-js/js/core/map.js";
import mountComponent from "../node_modules/@xylem-js/xylem-js/js/dom/mountComponent.js";
import normalizeArrayStore from "../node_modules/@xylem-js/xylem-js/js/array/normalizeArrayStore.js";
import parseHTML from "../node_modules/@xylem-js/xylem-js/js/dom/parseHTML.js";
import push from "../node_modules/@xylem-js/xylem-js/js/array_action/push.js";
import cumulate from "../node_modules/@xylem-js/xylem-js/js/core/cumulate.js";
import remove from "../node_modules/@xylem-js/xylem-js/js/array_action/remove.js";

function getProjectViewModel({title='',completionDate='',skills=[''],url='',description=''} = {})
{
	const title$ = createStore(title);
	const completionDate$ = createStore(completionDate);
	const skills$ = createArrayStore(skills.map((v) => createStore(v)));
	const url$ = createStore(url);
	const description$ = createStore(description);
	return {
		title$,
		description$,
		completionDate$,
		skills$,
		url$,
	};
}

const initialData = {
	fullName: 'Barun Kharel',
	email: 'barun@example.com',
	address: 'Kathmandu, Nepal',
	projects: [
		{
			title: 'Mero Pasal',
			description: 'This is an e-commerce app.',
			completionDate: (new Date()).toISOString().split('T')[0],
			skills: ['Javascript', 'PHP'],
			url: 'http://mero-pasal.com.np',
		},
		{
			title: 'Hello School',
			description: 'School Management System',
			completionDate: (new Date()).toISOString().split('T')[0],
			skills: ['Javascript', 'PHP'],
			url: '',
		},
	],
};

function intersperse(array, itemToInsert)
{
	const loopCount = array.length - 1;
	for (let i = 0; i < loopCount; i++) {
		array.splice(2 * i + 1, 0, itemToInsert);
	}
	return array;
}

class Root extends Component
{
	build()
	{
		const resume$ = createStore(initialData);

		const isEditMode$ = createStore(false);

		const onReset = () => cumulate(resume$, (v) => ({...v}));
		const onSave = (resume) => {
			resume$._(resume);
			isEditMode$._(false);
		};

		return parseHTML([
			'<div>', { class: 'container my-4' },
			[
				'<div>', { class: 'row' },
				[
					'<div>', { class: 'col-xxl-8 mx-auto' },
					[

						'<div>', { class: 'clearfix' },
						[
							'<button>', {
								class: 'btn btn-outline-secondary float-end',
								hidden: isEditMode$,
								'@click': () => isEditMode$._(true),
							},
							['Edit'],
							'</button>',
							'<button>', {
								class: 'btn btn-outline-secondary float-end ms-2',
								hidden: map(isEditMode$, (v) => !v),
								'@click': () => isEditMode$._(false),
							},
							['Cancel'],
							'</button>',
							'<button>', {
								class: 'btn btn-outline-secondary float-end',
								hidden: map(isEditMode$, (v) => !v),
								'@click': onReset,
							},
							['Reset'],
							'</button>',
						],
						'</div>',
						'<h1>', { class: 'h2' },
						['Resumé'],
						'</h1>',
						if_(isEditMode$, () => [
							new ResumeForm({resume$: resume$.readonly, onSave}),
						])
						.else(() => [
							new ResumeView({resume$: resume$.readonly}),
						])
						.endIf(),
					],
					'</div>',
				],
				'</div>',
			],
			'</div>',
		]);
	}
}

class ResumeView extends Component
{
	build({ resume$ })
	{
		const resume = resume$._();

		return parseHTML([
			'<div>', { style: 'border: 4px solid; padding: 50px;' },
			[
				'<div>', { class: 'mb-2' },
				[
					'<div>', { class: 'h3 text-center' },
					[ resume.fullName ],
					'</div>',
					'<div>', { class: 'text-center' },
					[ resume.email ],
					'</div>',
					'<div>', { class: 'text-center' },
					[ resume.address ],
					'</div>',
				],
				'</div>',
				'<hr/>',
				'<div>',
				[
					'<h5>', { class: 'my-4' },
					['Projects'],
					'</h5>',
					'<ol>',
					[
						forEach(resume.projects, (project) => parseHTML([
							'<li>', { class: 'my-3' },
							[
								'<div>',
								[ '<b>', [project.title], '</b>' ],
								'</div>',
								'<div>',
								[ project.description ],
								'</div>',
								'<div>',
								[
									'Completion Date: ',
									project.completionDate,
								],
								'</div>',
								'<div>',
								[
									'Skills: ',
									...intersperse(project.skills.map((skill) => ([
										'<span>', { class: 'badge text-bg-secondary' },
										[skill],
										'</span>',
									])), ' ').reduce((acc, item) => {
										acc.push(...item);
										return acc;
									}, []),
								],
								'</div>',
								'<div>',
								[
									'URL: ',
									'<a>', {
										href: project.url,
										target: '_blank',
									},
									[ project.url ],
									'</a>',
								],
								'</div>',
							],
							'</li>',
						]))
						.endForEach(),
					],
					'</ol>',
				],
				'</div>',
			],
			'</div>',
		]);
	}
}

class ResumeForm extends Component
{
	build(attrs)
	{
		const { onSave } = attrs;
		const resume$ = this.bindSupplier(attrs.resume$);
		resume$.subscribe((v) => {
			fullName$._(v.fullName);
			fullNameInputElement$._().value = v.fullName;
			email$._(v.email);
			emailInputElement$._().value = v.email;
			address$._(v.address);
			addressInputElement$._().value = v.address;

			projects$._(v.projects.map(getProjectViewModel));
		});

		const resume = resume$._();

		const fullNameInputElement$ = createStore();
		const emailInputElement$ = createStore();
		const addressInputElement$ = createStore();

		const fullName$ = createStore(resume.fullName);
		const email$ = createStore(resume.email);
		const address$ = createStore(resume.address);
		const projects$ = createArrayStore(resume.projects.map(getProjectViewModel));

		const normalizedProjects$ = normalizeArrayStore(projects$, (project) => combineNamedSuppliers({
			title: project.title$,
			description: project.description$,
			completionDate: project.completionDate$,
			skills: normalizeArrayStore(project.skills$, v => v),
			url: project.url$,
		}));

		const normalizedResume$ = combineNamedSuppliers({
			fullName: fullName$,
			email: email$,
			address: address$,
			projects: normalizedProjects$,
		});

		console.log(JSON.stringify(normalizedResume$._(), null, 2));
		normalizedResume$.subscribe((v) => {
			console.log(JSON.stringify(v, null, 2));
		});

		return parseHTML([
			'<form>', {
				'@submit': (ev) => {
					ev.preventDefault();
					onSave(normalizedResume$._());
				},
			},
			[
				'<div>', { class: 'mb-3' },
				[
					'<label>', {
						class: 'form-label',
						for: 'full-name',
					},
					['Full Name'],
					'</label>',
					'<input/>', {
						class: 'form-control',
						id: 'full-name',
						value: fullName$._(),
						'<>': fullNameInputElement$,
						'@input': flow([
							(ev) => ev.target.value,
							(v) => fullName$._(v),
						]),
					},
				],
				'</div>',
				'<div>', { class: 'mb-3' },
				[
					'<label>', {
						class: 'form-label',
						for: 'email',
					},
					['Email'],
					'</label>',
					'<input/>', {
						class: 'form-control',
						id: 'email',
						value: email$._(),
						'<>': emailInputElement$,
						'@input': flow([
							(ev) => ev.target.value,
							(v) => email$._(v),
						]),
					},
				],
				'</div>',
				'<div>', { class: 'mb-3' },
				[
					'<label>', {
						class: 'form-label',
						for: 'address',
					},
					['Address'],
					'</label>',
					'<input/>', {
						class: 'form-control',
						id: 'address',
						value: address$._(),
						'<>': addressInputElement$,
						'@input': flow([
							(ev) => ev.target.value,
							(v) => address$._(v),
						]),
					},
				],
				'</div>',
				'<h3>', { class: 'h5' },
				['Projects'],
				'</h3>',
				'<div>',
				[
					forEach(projects$, (project, index$) => {
						return parseHTML([
							'<div>', { class: 'card mt-3' },
							[
								'<h5>', { class: 'card-header' },
								[ map(index$, (i) => `Project ${i+1}`) ],
								'</h5>',
								'<div>', { class: 'card-body' },
								[
									'<div>', { class: 'mb-3' },
									[
										'<label>', {
											class: 'form-label',
											for: map(index$, (i) => `project-${i}-title`),
										},
										['Project Title'],
										'</label>',
										'<input/>', {
											class: 'form-control',
											id: map(index$, (i) => `project-${i}-title`),
											value: project.title$._(),
											'@input': flow([
												(ev) => ev.target.value,
												(v) => project.title$._(v),
											]),
										},
									],
									'</div>',
									'<div>', { class: 'mb-3' },
									[
										'<label>', {
											class: 'form-label',
											for: map(index$, (i) => `project-${i}-description`),
										},
										['Project Description'],
										'</label>',
										'<textarea>', {
											class: 'form-control',
											rows: '5',
											id: map(index$, (i) => `project-${i}-description`),
											'@input': flow([
												(ev) => ev.target.value,
												(v) => project.description$._(v),
											]),
										},
										[project.description$._()],
										'</textarea>',
									],
									'</div>',
									'<div>', { class: 'mb-3' },
									[
										'<label>', {
											class: 'form-label',
											for: map(index$, (i) => `project-${i}-completion-date`),
										},
										['Completion date'],
										'</label>',
										'<input/>', {
											type: 'date',
											class: 'form-control',
											id: map(index$, (i) => `project-${i}-completion-date`),
											value: project.completionDate$._(),
											'@input': flow([
												(ev) => ev.target.value,
												(v) => project.completionDate$._(v),
											]),
										},
									],
									'</div>',
									'<div>', { class: 'mb-3' },
									[
										'<label>', {
											class: 'form-label',
										},
										['Skills'],
										'</label>',
										'<div>',
										[
											forEach(project.skills$, (skill$, index$2, forEachItem) => {
												const indexProxy$ = forEachItem.bindSupplier(index$);

												return parseHTML([
													'<div>', { class: 'card mb-3' },
													[
														'<div>', { class: 'input-group' },
														[
															'<label>', {
																class: 'input-group-text',
																for: map(
																	combineSuppliers([indexProxy$, index$2]),
																	([i,i2])=>`project-${i}-skill-${i2}`,
																),
															},
															[ map(index$2, (i)=>`Skill ${i+1}`) ],
															'</label>',
															'<input/>', {
																class: 'form-control',
																id: map(
																	combineSuppliers([indexProxy$, index$2]),
																	([i,i2])=>`project-${i}-skill-${i2}`,
																),
																value: skill$._(),
																'@input': flow([
																	(ev) => ev.target.value,
																	(v) => skill$._(v),
																]),
															},
															'<button>', {
																type: 'button',
																class: 'btn btn-outline-danger',
																'@click': () => {
																	project.skills$.mutate(remove, index$2);
																},
															},
															['Remove'],
															'</button>',
														],
														'</div>',
													],
													'</div>',
												]);
											})
											.endForEach(),
										],
										'</div>',
										'<div>', { class: 'clearfix' },
										[
											'<button>', {
												type: 'button',
												class: 'btn btn-outline-primary float-end',
												'@click': () => {
													project.skills$.mutate(push, createStore(''));
												},
											},
											['Add Skill'],
											'</button>',
										],
										'</div>',
									],
									'</div>',
									'<div>', { class: 'mb-3' },
									[
										'<label>', {
											class: 'form-label',
											for: map(index$, (i) => `project-${i}-url`),
										},
										['URL'],
										'</label>',
										'<input/>', {
											class: 'form-control',
											id: map(index$, (i) => `project-${i}-url`),
											value: project.url$._(),
											'@input': flow([
												(ev) => ev.target.value,
												(v) => project.url$._(v),
											]),
										},
									],
									'</div>',
								],
								'</div>',
								'<div>', { class: 'card-footer' },
								[
									'<button>', {
										type: 'button',
										class: 'btn btn-outline-danger float-end',
										'@click': () => {
											projects$.mutate(remove, index$);
										},
									},
									['Remove'],
									'</button>',
								],
								'</div>',
							],
							'</div>',
						]);
					})
					.endForEach(),
				],
				'</div>',
				'<div>', { class: 'mt-3 clearfix' },
				[
					'<button>', {
						type: 'button',
						class: 'btn btn-outline-primary float-end',
						'@click': () => {
							projects$.mutate(push, getProjectViewModel());
						}
					},
					['Add Project'],
					'</button>',
				],
				'</div>',
				'<div>', { class: 'mt-4 clearfix w-25 d-grid ms-auto' },
				[
					'<button>', {
						type: 'submit',
						class: 'btn btn-success float-end',
					},
					['Save'],
					'</button>',
				],
				'</div>',
			],
			'</form>',
		]);
	}
}

mountComponent(new Root(), document.getElementById('root'));
