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
                            else value = undefined;
                        } else {
                            if (type === 'date') value = new Date(value);
                            if (type === 'boolean')
                                value = value === true || value === 'true' || value === 1;
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