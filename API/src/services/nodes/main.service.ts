import { repository } from "@loopback/repository";
import { CompanyListRepository, CompanyRepository, DagsRepository, DesignationRepository, SchedulerRepository } from "../../repositories";
import { AirflowDagService } from "./dag-creation.service";
import { inject } from "@loopback/core";
import { Initialize } from "./initialize.service";
import { Search } from "./search.service";
import { Locate } from "./locate.service";
import { Deliver } from "./deliver.service";
import { Transformation } from "./transformation.service";
import { HttpErrors } from "@loopback/rest";

export class Main {
    constructor(
        @repository(SchedulerRepository)
        public schedulerRepository: SchedulerRepository,
        @repository(DagsRepository)
        public dagsRepository: DagsRepository,
        @repository(DesignationRepository)
        public designationRepository: DesignationRepository,
        @repository(CompanyListRepository)
        public companyListRepository: CompanyListRepository,
        @inject('services.DagCreation')
        public dagsCreationService: AirflowDagService,
        @inject('services.Initialize')
        public initializeService: Initialize,
        @inject('services.Search')
        public searchService: Search,
        @inject('services.Locate')
        public locateService: Locate,
        @inject('services.Deliver')
        public deliverService: Deliver,
        @inject('services.Transformation')
        public transformationService: Transformation,
    ) { }

    // Register available services
    servicesMapper = [
        { nodeType: "initialize", service: this.initializeService.intializeNode.bind(this.initializeService) },
        { nodeType: "search", service: this.searchService.search.bind(this.searchService) },
        { nodeType: "locate", service: this.locateService.locateNode.bind(this.locateService) },
        { nodeType: "deliver", service: this.deliverService.deliverNode.bind(this.deliverService) },
        { nodeType: "transformation", service: this.transformationService.transformation.bind(this.transformationService) },
    ];

    // main service where schedulers are fetching...
    async main() {
        try {
            const schedulers: any = await this.schedulerRepository.find({
                where: {
                    and: [
                        { isScheduled: false },
                        { isDeleted: false },
                        { isActive: true }
                    ]
                },
                include: [
                    {
                        relation: 'workflow',
                        scope: {
                            include: [{ relation: 'workflowBlueprint' }]
                        }
                    }
                ]
            });

            if (!schedulers || schedulers.length === 0) {
                console.log('schedulers not found');
                return;
            }

            console.log('schedulers found');

            for (const scheduler of schedulers) {

                // lock scheduler early
                await this.schedulerRepository.updateById(
                    scheduler.id,
                    { isScheduled: true }
                );

                if (scheduler.schedulerFor === 0) {
                    const designations = await this.designationRepository.find({
                        where: {
                            and: [
                                { isActive: true },
                                { isDeleted: false }
                            ]
                        }
                    });

                    await Promise.all(
                        designations.map(async (designation) => {
                            const finalSearchArray = designations.map((desg) => {
                                return {
                                    selectorName: 'Search',
                                    value: desg.designation
                                }
                            })

                            const dagFileName =
                                await this.dagsCreationService.createDagFile(
                                    scheduler,
                                    designation?.designation || ''
                                );

                            if (dagFileName) {
                                await this.dagsRepository.create({
                                    dagName: `dag-${scheduler.schedularName}-${designation?.designation}`,
                                    dagFileName,
                                    schedulerId: scheduler.id,
                                    searchArray: finalSearchArray,
                                    isActive: true,
                                    isDeleted: false,
                                });
                            }
                        })
                    );

                } else if (scheduler.schedulerFor === 1) {
                    const companies = await this.companyListRepository.find();

                    companies.map(async (company) => {
                        const finalSearchArray = companies.map((comp) => {
                            return {
                                selectorName: 'Search',
                                value: `${comp.designation} at ${comp.companyName}`
                            }
                        })

                        const dagFileName =
                            await this.dagsCreationService.createDagFile(
                                scheduler,
                                `${company.designation} at ${company.companyName}` || ''
                            );

                        if (dagFileName) {
                            await this.dagsRepository.create({
                                dagName: `dag-${scheduler.schedularName}-${company.companyName}-${company?.designation}`,
                                dagFileName,
                                schedulerId: scheduler.id,
                                searchArray: finalSearchArray,
                                isActive: true,
                                isDeleted: false,
                            });
                        }
                    })
                } else {
                    const dagFileName =
                        await this.dagsCreationService.createDagFile(scheduler, '');

                    if (dagFileName) {
                        await this.dagsRepository.create({
                            dagName: `dag-${scheduler.schedularName}`,
                            dagFileName,
                            schedulerId: scheduler.id,
                            isActive: true,
                            isDeleted: false,
                        });
                    }
                }
            }
        } catch (error) {
            console.error('error in main service', error);
            throw error; // critical for Airflow
        }
    }

    // executing ETL flow...
    async extraction(searchField: string, schedulerId: string) {
        try {
            const scheduler: any = await this.schedulerRepository.findById(
                schedulerId,
                {
                    include: [
                        {
                            relation: 'workflow',
                            scope: {
                                include: [
                                    { relation: 'workflowBlueprint' }
                                ]
                            }
                        }
                    ]
                }
            );

            if (!scheduler) {
                console.log('no scheduler for give dag');
                return;
            };

            if (scheduler.isDeleted || !scheduler.isActive) {
                console.log('scheduler is already deleted or temporary In-Active');
                return;
            };

            if (!scheduler.workflow) {
                console.log('workflow is missing');
                return;
            };

            const workflow = scheduler.workflow;

            if (!workflow.workflowBlueprint) {
                console.log('workflow blueprint is missing');
                return;
            }

            const workflowBlueprint = workflow.workflowBlueprint;
            const nodesData = workflowBlueprint.nodes || [];
            let bluePrint = workflowBlueprint.bluePrint || [];
            const outputData: any = [];
            let lastOutputData: any = {};
            const executionResults = [];

            if (searchField) {
                bluePrint = bluePrint?.map((node: any) => {
                    if (node?.component?.type === 'search') {
                        return {
                            ...node,
                            component: {
                                ...node?.component,
                                data: {
                                    ...node?.component?.data,
                                    searchText: searchField
                                }
                            }
                        }
                    }

                    return node;
                })
            }

            console.log('bluePrint', bluePrint);
            // Sequential execution of nodes
            for (const node of nodesData) {
                try {
                    // Normal execution for non-decision nodes
                    const serviceDef = this.servicesMapper.find(
                        (item) => item.nodeType === node.type
                    );
                    if (!serviceDef) {
                        throw new Error(`No service mapped for nodeType: ${node.type}`);
                    }

                    const nodeConfig = bluePrint?.find(
                        (item: any) => item.id === node.id
                    )?.component;

                    const result: any = await serviceDef.service(nodeConfig, lastOutputData);

                    outputData.push({
                        nodeId: node.id,
                        nodeName: node.name,
                        output: result,
                    });

                    lastOutputData = result;
                } catch (err: any) {
                    outputData.push({
                        nodeId: node.id,
                        nodeName: node.name,
                        output: null,
                        error: err.message,
                    });
                    break;
                }
            }

            executionResults.push({
                dagId: scheduler.id,
                status: outputData.some((n: any) => n.error) ? "failed" : "completed",
                results: outputData,
            });
            return {
                message: "Extraction finished",
                count: executionResults.length,
                result: executionResults,
            };
        } catch (error) {
            console.error('error while doing extraction', error);
        }
    }
}