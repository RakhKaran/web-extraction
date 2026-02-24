import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    mongodb: {collection: 'DataFreshnessConfig'},
  },
})
export class DataFreshnessConfig extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'string',
    required: true,
  })
  sourceModel: string;

  @property({
    type: 'string',
    required: true,
  })
  sourceRepository: string;

  @property({
    type: 'string',
    required: true,
  })
  urlField: string;

  @property({
    type: 'object',
    default: {},
  })
  filters?: object;

  @property({
    type: 'object',
    required: true,
  })
  freshnessCheck: {
    type: 'simple' | 'content' | 'full-rescrape';
    requiredSelectors?: string[];
    fieldsToRescrape?: Array<{field: string; selector: string}>;
    session?: {
      enabled: boolean;
      storageStatePath: string;
    };
  };

  @property({
    type: 'object',
    required: true,
  })
  updateStrategy: {
    onNotFound: {
      action: 'update-fields' | 'delete-record' | 'do-nothing';
      fields?: object;
    };
    onFound: {
      action: 'update-timestamp' | 'update-fields' | 'do-nothing';
      fields?: object;
    };
  };

  @property({
    type: 'object',
    required: true,
  })
  schedule: {
    frequency: 'hourly' | 'daily' | 'every-3-days' | 'weekly' | 'monthly' | 'custom';
    time?: string;
    timezone?: string;
    cronExpression?: string;
  };

  @property({
    type: 'object',
    default: {
      batchSize: 50,
      delayBetweenJobs: 2000,
      maxJobsPerRun: 500,
    },
  })
  batchProcessing?: {
    batchSize: number;
    delayBetweenJobs: number;
    maxJobsPerRun?: number;
  };

  @property({
    type: 'boolean',
    default: true,
  })
  isActive?: boolean;

  @property({
    type: 'date',
  })
  lastRunAt?: Date;

  @property({
    type: 'date',
  })
  nextRunAt?: Date;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt?: Date;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  updatedAt?: Date;

  constructor(data?: Partial<DataFreshnessConfig>) {
    super(data);
  }
}

export interface DataFreshnessConfigRelations {
  // describe navigational properties here
}

export type DataFreshnessConfigWithRelations = DataFreshnessConfig & DataFreshnessConfigRelations;
