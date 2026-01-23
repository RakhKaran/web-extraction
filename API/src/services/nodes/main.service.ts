import { repository } from "@loopback/repository";
import { CompanyListRepository, CompanyRepository, DagsRepository, DesignationRepository, JobListRepository, SchedulerRepository } from "../../repositories";
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
                applicants: job.applicants,
                openings: job.openings,
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

            console.log("Total jobs to post:", jobsDataPayload.length);

            const BATCH_SIZE = 100;
            const payloadBatches = this.chunkArray(jobsDataPayload, BATCH_SIZE);
            const jobIdBatches = this.chunkArray(jobs.map(j => j.id), BATCH_SIZE);

            for (let i = 0; i < payloadBatches.length; i++) {
                const batchPayload = payloadBatches[i];
                const batchJobIds = jobIdBatches[i];

                console.log(`Posting batch ${i + 1}/${payloadBatches.length} — size: ${batchPayload.length}`);

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