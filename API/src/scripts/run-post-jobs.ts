#!/usr/bin/env node
import { Main } from "../services/nodes/main.service";
import { WebExtractionApplication } from "../application";
import { ApplicationConfig } from "@loopback/core";

async function postJobs() {
    let exitCode = 0;

    const config: ApplicationConfig = {
        rest: {
            port: 0,
            host: '127.0.0.1',
        },
    };

    const app = new WebExtractionApplication(config);
    await app.boot();
    await app.start();

    try {
        const mainService = await app.get<Main>('services.Main');
        await mainService.postJobsToAltiv();

        console.log('Post jobs workflow completed successfully');
    } catch (err: any) {
        console.error('Post jobs workflow failed', err);
        exitCode = 1;
    } finally {
        console.log('Stopping the app');

        try {
            await app.stop();
        } catch (e) {
            console.warn('Error stopping app', e);
        }

        try {
            const ds: any = await app.get('datasources.db');
            if (ds?.connector?.disconnect) {
                await ds.connector.disconnect();
            }
        } catch {
            console.warn('No datasource to disconnect');
        }

        process.exit(exitCode);
    }
}

postJobs();
