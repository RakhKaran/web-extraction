import { Context, inject } from "@loopback/core";
import { DefaultCrudRepository } from "@loopback/repository";

export class Transformation {
    constructor(
        @inject.context() private ctx: Context,
    ) { }

    // transformation node
    async transformation(node: any, previousOutput: any) {
        try {
            if (!node.stagingMode || !node.stagingModelName || !node.stagingRespositoryName) {
                throw new Error("Staging details are not properly configured");
            }

            const stagingRepo = await this.ctx.get<DefaultCrudRepository<any, any>>(
                `repositories.${node.stagingRespositoryName}`,
            );

            if (!node.deliverMode || !node.deliverModelName || !node.deliverRespositoryName) {
                throw new Error("Deliver details are not properly configured");
            }

            const deliverRepo = await this.ctx.get<DefaultCrudRepository<any, any>>(
                `repositories.${node.deliverRespositoryName}`,
            );

            const deliveredRecords: any[] = [];
            let conditions: any[] = [];

            // --- Build filter based on dataAcceptanceRule
            if (node.dataAcceptanceRule && node.dataAcceptanceRule.length > 0) {
                node.dataAcceptanceRule.forEach((data: any) => {
                    if (['string', 'number', 'boolean'].includes(data.type)) {
                        conditions.push({ [data.field]: data.value });
                    }

                    if (data.type === 'date') {
                        const dateCondition: any = {};
                        if (data.startDate) dateCondition.gte = new Date(data.startDate);
                        if (data.endDate) dateCondition.lte = new Date(data.endDate);
                        conditions.push({ [data.field]: dateCondition });
                    }
                });
            }

            const filter = {
                where: {
                    and: conditions.length > 0 ? conditions : [{}],
                },
                fields: {
                    ...Object.fromEntries(node.fields.map((f: any) => [f.mappedField, true])),
                },
            };

            // fetch data
            const data = await stagingRepo.find(filter);

            // remove system fields
            const stagingData = data.map(item => {
                const obj = item.toJSON ? item.toJSON() : item; // convert Entity to plain object if needed
                const { createdAt, updatedAt, ...rest } = obj;
                return rest;
            });

            const successRecords: any[] = [];
            const errorRecords: any[] = [];

            for (const record of stagingData) {
                const normalized: any = {};
                let hasError = false;

                for (const field of node.fields) {
                    let value = record[field.mappedField];

                    // Null check
                    if (!field.isNullAccepted && (value === null || value === undefined || value === "")) {
                        console.log('1', field.mappedField);
                        hasError = true;
                        continue;
                    }

                    switch (field.type) {
                        case 'string':
                            value = value ? String(value).trim() : null;
                            break;

                        case 'number':
                            if (typeof value === "string") {
                                // Extract first number from string
                                const match = value.match(/\d+/);
                                if (match) {
                                    value = Number(match[0]); // take first numeric part
                                } else {
                                    console.log('2', field.mappedField);

                                    hasError = true; // invalid number (e.g. "N/A")
                                }
                            } else if (typeof value === "number") {
                                value = value;
                            } else {
                                console.log('3', field.mappedField);

                                hasError = true;
                            }
                            break;

                        case 'boolean':
                            value = Boolean(value);
                            break;

                        case 'date': {
                            const parsedDate = this.parseDate(value, field.rules); // pass rules if you support them
                            if (parsedDate && !isNaN(parsedDate.getTime())) {
                                value = parsedDate;
                            } else {
                                console.log('value', value)
                                console.log('parsedDate', parsedDate);
                                console.log('4', field.mapped)
                                hasError = true;   // mark record as errored
                                value = null;      // or keep original value if you want to store raw
                            }
                            break;
                        }

                        case 'array':
                            if (Array.isArray(value)) {
                                value = [...new Set(value.map((v: any) => String(v).trim()))];
                            } else {
                                value = [];
                            }
                            break;
                    }

                    normalized[field.modelField] = value;
                }

                // Add additional fields
                for (const extra of node.additionalFields || []) {
                    normalized[extra.modelField] =
                        // Case 1: Date type
                        extra.type === 'date' && !extra.value
                            ? new Date() // if no value is provided, default to "now"

                            // Case 2: Boolean type
                            : extra.type === 'boolean'
                                ? (extra.value === true) // convert "true"/"false" string to boolean

                                // Case 3: All other types
                                : extra.value; // keep as-is (string, number, etc.)
                }

                // Push into success or error bucket
                if (hasError) {
                    errorRecords.push({ original: record, normalized });
                } else {
                    successRecords.push(normalized);
                }
            }

            // Now you can insert only successRecords
            for (const data of successRecords) {
                const exists = await deliverRepo.findOne({
                    where: {
                        and: Object.keys(data).map(key => ({ [key]: data[key] })),
                    },
                });
                if (!exists) {
                    await deliverRepo.create(data);
                }
            }
            return {
                success: true,
                nodetype: 'transformation',
                timestamp: new Date().toISOString(),
                browser: previousOutput.browser,
                browserContext: previousOutput.browserContext,
                page: previousOutput.page,
                successRecords: successRecords.length,
                errorRecords: errorRecords.length
            };
        } catch (error) {
            console.log('error in transformstion node', error);
        }
    }

    // --- Helper to handle "x days ago" etc.
    private toStartOfDay(date: Date): Date {
        date.setHours(0, 0, 0, 0);
        return date;
    }

    private parseDate(input: any, rules?: any[]): Date | null {
        if (!input) return null;

        if (typeof input === "string") {
            const normalized = input.toLowerCase().trim();

            // Loop through rules
            if (rules && rules.length) {
                for (const rule of rules) {
                    const [pattern, type] = Object.entries(rule)[0];

                    switch (type) {
                        case "today": {
                            if (normalized.includes("today")) return this.toStartOfDay(new Date());
                            break;
                        }

                        case "yesterday": {
                            if (normalized.includes("yesterday")) {
                                const d = new Date();
                                d.setDate(d.getDate() - 1);
                                return this.toStartOfDay(d);
                            }
                            break;
                        }

                        case "days": {
                            const match = normalized.match(/(\d+)\+?\s+day/);
                            if (match) {
                                const days = parseInt(match[1], 10);
                                const d = new Date();
                                d.setDate(d.getDate() - days);
                                return this.toStartOfDay(d);
                            }
                            break;
                        }

                        case "weeks": {
                            const match = normalized.match(/(\d+)\+?\s+week/);
                            if (match) {
                                const weeks = parseInt(match[1], 10);
                                const d = new Date();
                                d.setDate(d.getDate() - weeks * 7);
                                return this.toStartOfDay(d);
                            }
                            break;
                        }

                        case "months": {
                            const match = normalized.match(/(\d+)\+?\s+month/);
                            if (match) {
                                const months = parseInt(match[1], 10);
                                const d = new Date();
                                d.setMonth(d.getMonth() - months);
                                return this.toStartOfDay(d);
                            }
                            break;
                        }

                        case "years": {
                            const match = normalized.match(/(\d+)\+?\s+year/);
                            if (match) {
                                const years = parseInt(match[1], 10);
                                const d = new Date();
                                d.setFullYear(d.getFullYear() - years);
                                return this.toStartOfDay(d);
                            }
                            break;
                        }

                        case "date": {
                            // handles: "posted on 12 September 2025", "12/09/2025", etc.
                            const dateMatch = normalized.match(
                                /(\d{1,2}[\/\- ]\d{1,2}[\/\- ]\d{2,4}|\d{1,2}\s+[a-zA-Z]+\s+\d{4})/
                            );
                            if (dateMatch) {
                                const parsed = new Date(dateMatch[0]);
                                if (!isNaN(parsed.getTime())) return this.toStartOfDay(parsed);
                            }
                            break;
                        }
                    }
                }
            }

            // fallback: try direct Date parse
            const fallback = new Date(normalized);
            if (!isNaN(fallback.getTime())) return this.toStartOfDay(fallback);
        }

        if (input instanceof Date) return this.toStartOfDay(input);

        return null;
    }
}