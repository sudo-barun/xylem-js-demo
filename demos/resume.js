import "../lib/js/registerPush.js";
import "../lib/js/registerSplice.js";
import arrayToVirtualDom from "../lib/js/dom/arrayToVirtualDom.js";
import Component from "../lib/js/dom/Component.js";
import createArrayStore from "../lib/js/core/createArrayStore.js";
import createStore from "../lib/js/core/createStore.js";
import combineStores from "../lib/js/core/combineStores.js";
import combineNamedStores from "../lib/js/core/combineNamedStores.js";
import flow from "../node_modules/lodash-es/flow.js";
import forEach from "../lib/js/dom/forEach.js";
import if_ from "../lib/js/dom/if_.js";
import map from "../lib/js/core/map.js";
import mount from "../lib/js/dom/mount.js";
import normalizeArrayStore from "../lib/js/core/normalizeArrayStore.js";
import push from "../lib/js/core/push.js";
import reduce from "../lib/js/core/reduce.js";
import splice from "../lib/js/core/splice.js";

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

		const onReset = () => reduce(resume$, (v) => ({...v}));
		const onSave = (resume) => {
			resume$(resume);
			isEditMode$(false);
		};

		return arrayToVirtualDom([
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
								'@click': () => isEditMode$(true),
							},
							['Edit'],
							'</button>',
							'<button>', {
								class: 'btn btn-outline-secondary float-end ms-2',
								hidden: map(isEditMode$, (v) => !v),
								'@click': () => isEditMode$(false),
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
		const resume = resume$();

		return arrayToVirtualDom([
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
						forEach(resume.projects, (project) => arrayToVirtualDom([
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
									])), ' ').flat(),
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
	build({ resume$, onSave })
	{
		resume$.subscribe((v) => {
			fullName$(v.fullName);
			fullNameInputElement$().value = v.fullName;
			email$(v.email);
			emailInputElement$().value = v.email;
			address$(v.address);
			addressInputElement$().value = v.address;

			projects$(v.projects.map(getProjectViewModel));
		});

		const resume = resume$();

		const fullNameInputElement$ = createStore();
		const emailInputElement$ = createStore();
		const addressInputElement$ = createStore();

		const fullName$ = createStore(resume.fullName);
		const email$ = createStore(resume.email);
		const address$ = createStore(resume.address);
		const projects$ = createArrayStore(resume.projects.map(getProjectViewModel));

		const normalizedProjects$ = normalizeArrayStore(projects$, (project) => combineNamedStores({
			title: project.title$,
			description: project.description$,
			completionDate: project.completionDate$,
			skills: normalizeArrayStore(project.skills$),
			url: project.url$,
		}));

		const normalizedResume$ = combineNamedStores({
			fullName: fullName$,
			email: email$,
			address: address$,
			projects: normalizedProjects$,
		});

		console.log(JSON.stringify(normalizedResume$(), null, 2));
		normalizedResume$.subscribe((v) => {
			console.log(JSON.stringify(v, null, 2));
		});

		return arrayToVirtualDom([
			'<form>', {
				'@submit': (ev) => {
					ev.preventDefault();
					onSave(normalizedResume$());
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
						value: fullName$(),
						'<>': fullNameInputElement$,
						'@input': flow([
							(ev) => ev.target.value,
							fullName$,
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
						value: email$(),
						'<>': emailInputElement$,
						'@input': flow([
							(ev) => ev.target.value,
							email$,
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
						value: address$(),
						'<>': addressInputElement$,
						'@input': flow([
							(ev) => ev.target.value,
							address$,
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
						return arrayToVirtualDom([
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
											value: project.title$(),
											'@input': flow([
												(ev) => ev.target.value,
												project.title$,
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
												project.description$,
											]),
										},
										[project.description$()],
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
											value: project.completionDate$(),
											'@input': flow([
												(ev) => ev.target.value,
												project.completionDate$,
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
											forEach(project.skills$, function (skill$, index$2) {
												index$ = this.deriveStore(index$);

												return arrayToVirtualDom([
													'<div>', { class: 'card mb-3' },
													[
														'<div>', { class: 'input-group' },
														[
															'<label>', {
																class: 'input-group-text',
																for: map(
																	combineStores([index$, index$2]),
																	([i,i2])=>`project-${i}-skill-${i2}`,
																),
															},
															[ map(index$2, (i)=>`Skill ${i+1}`) ],
															'</label>',
															'<input/>', {
																class: 'form-control',
																id: map(
																	combineStores([index$, index$2]),
																	([i,i2])=>`project-${i}-skill-${i2}`,
																),
																value: skill$(),
																'@input': flow([
																	(ev) => ev.target.value,
																	skill$,
																]),
															},
															'<button>', {
																type: 'button',
																class: 'btn btn-outline-danger',
																'@click': () => {
																	project.skills$.mutate(splice, undefined, index$2);
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
											value: project.url$(),
											'@input': flow([
												(ev) => ev.target.value,
												project.url$,
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
											projects$.mutate(splice, undefined, index$);
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

mount(new Root(), document.getElementById('root'));
