import { repository } from "@loopback/repository";
import { CompanyListRepository, DagsRepository, DesignationRepository, JobListRepository, SchedulerExecutionLogRepository, SchedulerExecutionRepository, SchedulerRepository } from "../../repositories";
import { AirflowDagService } from "./dag-creation.service";
import { inject } from "@loopback/core";
import { Initialize } from "./initialize.service";
import { Search } from "./search.service";
import { Locate } from "./locate.service";
import { Deliver } from "./deliver.service";
import { Transformation } from "./transformation.service";
import { HttpErrors } from "@loopback/rest";
import axios from "axios";

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
        @repository(JobListRepository)
        public jobListRepository: JobListRepository,
        @repository(SchedulerExecutionRepository)
        public schedulerExecutionRepository: SchedulerExecutionRepository,
        @repository(SchedulerExecutionLogRepository)
        public schedulerExecutionLogRepository: SchedulerExecutionLogRepository,
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

    private async writeExecutionLog(
        executionId: string,
        schedulerId: string,
        message: string,
        logType = 0,
        nodeType?: string,
        step?: string,
        payload?: object,
    ) {
        await this.schedulerExecutionLogRepository.create({
            executionId,
            schedulerId,
            message,
            logType,
            nodeType,
            step,
            payload,
        });
    }

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
                    const companyConfigs: any[] = await this.companyListRepository.find({
                        where: {
                            and: [
                                { isDeleted: false },
                                { isActive: true },
                            ]
                        }
                    });

                    for (const companyConfig of companyConfigs) {
                        const companyName = companyConfig.companyName;
                        const designations = Array.isArray(companyConfig.designations)
                            ? companyConfig.designations
                            : (companyConfig.designation ? [companyConfig.designation] : []);

                        for (const designation of designations) {
                            const searchValue = `${designation} at ${companyName}`;
                            const finalSearchArray = [
                                {
                                    selectorName: 'Search',
                                    value: searchValue,
                                }
                            ];

                            const dagFileName = await this.dagsCreationService.createDagFile(
                                scheduler,
                                searchValue
                            );

                            if (dagFileName) {
                                await this.dagsRepository.create({
                                    dagName: `dag-${scheduler.schedularName}-${companyName}-${designation}`,
                                    dagFileName,
                                    schedulerId: scheduler.id,
                                    searchArray: finalSearchArray,
                                    isActive: true,
                                    isDeleted: false,
                                });
                            }
                        }
                    }
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
    async extraction(
        searchField: string,
        schedulerId: string,
        executionContext?: {
            airflowDagId?: string;
            airflowTaskId?: string;
            airflowRunId?: string;
            airflowTryNumber?: number;
        },
    ) {
        const startedAt = new Date();
        let executionId: string | undefined;
        try {
            const execution = await this.schedulerExecutionRepository.create({
                schedulerId,
                searchField,
                status: 'running',
                startedAt,
                airflowDagId: executionContext?.airflowDagId,
                airflowTaskId: executionContext?.airflowTaskId,
                airflowRunId: executionContext?.airflowRunId,
                airflowTryNumber: executionContext?.airflowTryNumber,
                meta: executionContext ?? {},
            });
            executionId = execution.id;

            await this.writeExecutionLog(
                execution.id!,
                schedulerId,
                'Scheduler execution started',
                0,
                undefined,
                'start',
                {searchField},
            );

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

            await this.schedulerExecutionRepository.updateById(execution.id!, {
                dagName: scheduler.schedularName,
            });

            if (scheduler.isDeleted || !scheduler.isActive) {
                console.log('scheduler is already deleted or temporary In-Active');
                await this.writeExecutionLog(
                    execution.id!,
                    schedulerId,
                    'Scheduler is deleted or inactive',
                    1,
                );
                await this.schedulerExecutionRepository.updateById(execution.id!, {
                    status: 'failed',
                    endedAt: new Date(),
                    durationMs: Date.now() - startedAt.getTime(),
                    errorMessage: 'Scheduler is deleted or inactive',
                });
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

                    await this.writeExecutionLog(
                        execution.id!,
                        schedulerId,
                        `Node execution started: ${node.type}`,
                        0,
                        node.type,
                        'node_start',
                        {nodeId: node.id, nodeName: node.name},
                    );

                    const result: any = await serviceDef.service(nodeConfig, lastOutputData);

                    outputData.push({
                        nodeId: node.id,
                        nodeName: node.name,
                        output: result,
                    });

                    lastOutputData = result;

                    await this.writeExecutionLog(
                        execution.id!,
                        schedulerId,
                        `Node execution completed: ${node.type}`,
                        2,
                        node.type,
                        'node_success',
                    );
                } catch (err: any) {
                    outputData.push({
                        nodeId: node.id,
                        nodeName: node.name,
                        output: null,
                        error: err.message,
                    });

                    await this.writeExecutionLog(
                        execution.id!,
                        schedulerId,
                        `Node execution failed: ${node.type}`,
                        1,
                        node.type,
                        'node_error',
                        {error: err.message},
                    );
                    break;
                }
            }

            executionResults.push({
                dagId: scheduler.id,
                status: outputData.some((n: any) => n.error) ? "failed" : "completed",
                results: outputData,
            });

            const finalStatus = outputData.some((n: any) => n.error) ? "failed" : "success";
            const endedAt = new Date();
            await this.schedulerExecutionRepository.updateById(execution.id!, {
                status: finalStatus,
                endedAt,
                durationMs: endedAt.getTime() - startedAt.getTime(),
            });

            await this.writeExecutionLog(
                execution.id!,
                schedulerId,
                `Scheduler execution ${finalStatus}`,
                finalStatus === 'success' ? 2 : 1,
                undefined,
                'end',
            );

            return {
                message: "Extraction finished",
                count: executionResults.length,
                result: executionResults,
                executionId: execution.id,
            };
        } catch (error) {
            console.error('error while doing extraction', error);
            if (executionId) {
                const endedAt = new Date();
                await this.schedulerExecutionRepository.updateById(executionId, {
                    status: 'failed',
                    endedAt,
                    durationMs: endedAt.getTime() - startedAt.getTime(),
                    errorMessage: error?.message ?? 'Unknown extraction error',
                });
                await this.writeExecutionLog(
                    executionId,
                    schedulerId,
                    `Scheduler execution failed: ${error?.message ?? 'Unknown extraction error'}`,
                    1,
                    undefined,
                    'end',
                );
            }
            throw error;
        }
    }

    // helper function
    chunkArray<T>(arr: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    }

    // Post jobs to altiv
    async postJobsToAltiv() {
        try {
            const jobs = await this.jobListRepository.find({
                where: {
                    and: [
                        { isActive: true },
                        { isDeleted: false },
                        // { isPostedToAltiv: false }
                    ]
                }
            });

            if (!jobs.length) {
                console.log("No jobs found to post.");
                return true;
            }

            const jobsDataPayload = jobs.map((job) => ({
                jobTitle: job.title,
                company: job.company,
                location: job.location,
                applicants: job.applicants?.toString() || 'NA',
                openings: job.openings?.toString() || 'NA',
                jobType: "Full Time, Permanent",
                salaryRange: job.salary,
                experience: job.experience,
                skillRequirements: job.keySkills,
                description: job.description,
                redirectUrl: job.redirectUrl,
                postedAt: job.posted,
                isAsync: false,
                isDeleted: false
            }));

            const BATCH_SIZE = 100;
            const payloadBatches = this.chunkArray(jobsDataPayload, BATCH_SIZE);
            const jobIdBatches = this.chunkArray(jobs.map(j => j.id), BATCH_SIZE);

            for (let i = 0; i < payloadBatches.length; i++) {
                const batchPayload = payloadBatches[i];
                const batchJobIds = jobIdBatches[i];

                console.log(`Posting batch ${i + 1}/${payloadBatches.length} — size: ${batchPayload.length}`);

                console.log('job object', batchPayload[0]);

                const response = await axios.post(
                    'https://api.staging.altiv.ai/add-bulk-jobs',
                    batchPayload,
                    { timeout: 60_000 } // optional safety
                );

                if (response.data?.success) {
                    await this.jobListRepository.updateAll(
                        { isPostedToAltiv: true },
                        { id: { inq: batchJobIds } }
                    );
                    console.log(`Batch ${i + 1} marked as posted`);
                } else {
                    console.error(`Batch ${i + 1} failed`, response.data);
                    throw new Error("Altiv API batch failed");
                }
            }

            console.log("All batches posted successfully");
            return true;

        } catch (error) {
            console.error("Error while posting jobs to Altiv:", error?.response?.data || error);
            throw error;
        }
    }
}
