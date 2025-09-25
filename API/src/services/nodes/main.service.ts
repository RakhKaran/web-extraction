import { repository } from "@loopback/repository";
import { DagsRepository, DesignationRepository, SchedulerRepository } from "../../repositories";
import { AirflowDagService } from "./dag-creation.service";
import { inject } from "@loopback/core";
import { Initialize } from "./initialize.service";
import { Search } from "./search.service";
import { Locate } from "./locate.service";
import { Deliver } from "./deliver.service";
import { Transformation } from "./transformation.service";

export class Main {
    constructor(
        @repository(SchedulerRepository)
        public schedulerRepository: SchedulerRepository,
        @repository(DagsRepository)
        public dagsRepository: DagsRepository,
        @repository(DesignationRepository)
        public designationRepository: DesignationRepository,
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
            const schedulers : any = await this.schedulerRepository.find({
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
                            include: [
                                { relation: 'workflowBlueprint' }
                            ]
                        }
                    }
                ]
            });

            if (schedulers && schedulers.length > 0) {
                console.log('schedulers found');
                for (const scheduler of schedulers) {
                    if (scheduler.schedulerFor === 0) {
                        console.log('entered');
                        const designations = await this.designationRepository.find({
                            where: {
                                and: [
                                    { isActive: true },
                                    { isDeleted: false }
                                ]
                            }
                        });
                        console.log('designation found', designations);

                        for (let designation of designations) {
                            console.log('designation found');
                            const searchNodes = scheduler?.workflow?.workflowBlueprint?.bluePrint?.filter((node: any) => node.component.type === 'search');

                            const finalSearchArray = searchNodes?.map((node: any) => ({
                                selectorName: node?.component?.selector?.name,
                                searchType: node?.component?.searchType,
                                value: node?.component?.searchType === 'jobs' ? designation?.designation : ''
                            }));

                            const dagFileName = await this.dagsCreationService.createDagFile(scheduler, (designation?.designation || ''));

                            if (dagFileName) {
                                // creating entries in db..
                                await this.dagsRepository.create({
                                    dagName: `dag-${scheduler.schedularName}-${designation?.designation}`,
                                    dagFileName: dagFileName,
                                    schedulerId: scheduler.id,
                                    searchArray: finalSearchArray,
                                    isActive: true,
                                    isDeleted: false,
                                });
                            }
                        }

                        await this.schedulerRepository.updateById(scheduler.id, { isScheduled: true });
                    } else {
                        console.log('designation not found');
                        // we will create airflow dags here...
                        const dagFileName = await this.dagsCreationService.createDagFile(scheduler, '');

                        if (dagFileName) {
                            // creating entries in db..
                            await this.dagsRepository.create({
                                dagName: `dag-${scheduler.schedularName}`,
                                dagFileName: dagFileName,
                                schedulerId: scheduler.id,
                                isActive: true,
                                isDeleted: false,
                            });

                            await this.schedulerRepository.updateById(scheduler.id, { isScheduled: true });
                        }
                    }
                }
            }

            console.log('schedulers not found');
        } catch (error) {
            console.error('error in main service', error);
        }
    }

    // executing ETL flow...
    async extraction(schedulerId: string) {
        try {
            // const dag = await this.dagsRepository.findById(dagId);

            // if (!dag) {
            //     console.log(`dag with ID ${dagId} not found`);
            //     return;
            // }

            // if (dag.isDeleted || !dag.isActive) {
            //     console.log('dag is already deleted or temporary In-Active');
            //     return;
            // };

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
            const bluePrint = workflowBlueprint.bluePrint;
            const outputData: any = [];
            let lastOutputData: any = {};
            const executionResults = [];

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