#!/usr/bin/env node
import { Main } from "../services/nodes/main.service";
import { WebExtractionApplication } from "../application";
import { ApplicationConfig } from "@loopback/core";

async function extraction(searchField: string, schedulerId: string) {
    const config: ApplicationConfig = {
        rest: {
            port: 0,
            host: '127.0.0.1',
        },
    };

    const app = new WebExtractionApplication(config);
    await app.boot();
    await app.start();

    const mainService = await app.get<Main>('services.Main');
    const executionContext = {
        airflowDagId: process.env.AIRFLOW_CTX_DAG_ID,
        airflowTaskId: process.env.AIRFLOW_CTX_TASK_ID,
        airflowRunId: process.env.AIRFLOW_CTX_DAG_RUN_ID,
        airflowTryNumber: process.env.AIRFLOW_CTX_TRY_NUMBER
            ? Number(process.env.AIRFLOW_CTX_TRY_NUMBER)
            : undefined,
    };

    try {
        const result = await mainService.extraction(searchField, schedulerId, executionContext);
        console.log(JSON.stringify(result));
    } catch (err: any) {
        console.error(JSON.stringify({ error: err.message }));
        process.exit(1);
    } finally {
        console.log('stopping the app');
        await app.stop();

        // disconnect datasource if exists
        try {
            const ds: any = await app.get('datasources.db');
            if (ds?.connector?.disconnect) {
                await ds.connector.disconnect();
            }
        } catch (err) {
            console.warn('No datasource to disconnect');
        }

        setImmediate(() => process.exit(0));
    }
}

// Get schedulerId from CLI args
const searchField = process.argv[3] ?? '';
const schedulerId = process.argv[2];

if (!schedulerId) {
    console.error("Usage: node run-extraction.js <schedulerId> [searchField]");
    process.exit(1);
}

extraction(searchField, schedulerId);
