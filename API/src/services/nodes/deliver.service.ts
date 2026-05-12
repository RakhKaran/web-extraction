import { Context, inject } from "@loopback/core";
import { DefaultCrudRepository } from "@loopback/repository";

export class Deliver {
    constructor(
        @inject.context() private ctx: Context,
    ) { }

    // deliver node
    async deliverNode(node: any, previousOutput: any) {
        try {
            const data = previousOutput?.extractedCards;
            console.log('extracted data', previousOutput?.extractedCards)
            if (!data || data.length === 0) {
                console.log('⚠️ No data to deliver');
                return [];
            }

            if (!node.respositoryName) {
                throw new Error(`Deliver node missing "repository" config`);
            }

            // explicitly type cast
            const repo = await this.ctx.get<DefaultCrudRepository<any, any>>(
                `repositories.${node.respositoryName}`,
            );

            const deliveredRecords: any[] = [];
            for (const record of data) {
                try {
                    const payload: any = {};

                    // Map fields
                    for (const field of node.fields ?? []) {
                        const { modelField, mappedField, type } = field;
                        let value = record[mappedField];

                        if (value === undefined || value === null || value === '') {
                            if (type === 'string') value = 'NA';
                            else if (type === 'date') value = new Date();
                            else if (type === 'boolean') value = false;
                            else if (type === 'number') value = 0;
                            else if (type === 'array') value = [];
                            else value = undefined;
                        } else {
                            if (type === 'date') value = new Date(value);
                            if (type === 'boolean')
                                value = value === true || value === 'true' || value === 1;
                            if (type === 'number') {
                                if (typeof value === 'string') {
                                    const match = value.match(/-?\d+(\.\d+)?/);
                                    value = match ? Number(match[0]) : 0;
                                } else if (typeof value !== 'number') {
                                    value = 0;
                                }
                            }
                            if (type === 'array' && !Array.isArray(value)) {
                                value = value ? [String(value)] : [];
                            }
                        }

                        payload[modelField] = value;
                    }

                    // Handle additional fields
                    for (const addField of node.additionalFields ?? []) {
                        let value = addField.value;

                        if (value === undefined || value === null || value === '') {
                            if (addField.type === 'string') value = 'NA';
                            else if (addField.type === 'date') value = new Date();
                            else if (addField.type === 'boolean') value = false;
                            else value = undefined;
                        } else {
                            if (addField.type === 'date') value = new Date(value);
                            if (addField.type === 'boolean')
                                value = value === true || value === 'true' || value === 1;
                        }

                        payload[addField.modelField] = value;
                    }

                    if (!payload.source && previousOutput?.__meta?.source) {
                        payload.source = previousOutput.__meta.source;
                    }
                    if (!payload.blueprintId && previousOutput?.__meta?.blueprintId) {
                        payload.blueprintId = previousOutput.__meta.blueprintId;
                    }
                    if (!payload.workflowId && previousOutput?.__meta?.workflowId) {
                        payload.workflowId = previousOutput.__meta.workflowId;
                    }
                    if (payload.isActive === undefined || payload.isActive === null) {
                        payload.isActive = true;
                    }

                    // Save using repository
                    const created = await repo.create(payload);
                    deliveredRecords.push(created);

                } catch (error) {
                    console.log('error while delivering data', error);
                }
            }

            return {
                success: true,
                nodetype: 'deliver',
                timestamp: new Date().toISOString(),
                browser: previousOutput.browser,
                browserContext: previousOutput.browserContext,
                page: previousOutput.page,
            }
        } catch (error) {
            console.log('error in deliver node', error);
        }
    }
}
