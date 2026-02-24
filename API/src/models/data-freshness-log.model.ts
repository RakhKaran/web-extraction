import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    mongodb: {collection: 'DataFreshnessLog'},
  },
})
export class DataFreshnessLog extends Entity {
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
  configId: string;

  @property({
    type: 'string',
  })
  configName?: string;

  @property({
    type: 'date',
    required: true,
    default: () => new Date(),
  })
  runAt: Date;

  @property({
    type: 'number',
    default: 0,
  })
  totalChecked?: number;

  @property({
    type: 'number',
    default: 0,
  })
  stillActive?: number;

  @property({
    type: 'number',
    default: 0,
  })
  expired?: number;

  @property({
    type: 'number',
    default: 0,
  })
  errors?: number;

  @property({
    type: 'number',
    default: 0,
  })
  duration?: number; // in milliseconds

  @property({
    type: 'string',
    required: true,
    default: 'running',
  })
  status: 'running' | 'success' | 'failed' | 'partial';

  @property({
    type: 'string',
  })
  errorMessage?: string;

  @property({
    type: 'array',
    itemType: 'object',
    default: [],
  })
  details?: Array<{
    recordId: string;
    url: string;
    status: 'active' | 'expired' | 'error';
    message?: string;
  }>;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt?: Date;

  constructor(data?: Partial<DataFreshnessLog>) {
    super(data);
  }
}

export interface DataFreshnessLogRelations {
  // describe navigational properties here
}

export type DataFreshnessLogWithRelations = DataFreshnessLog & DataFreshnessLogRelations;
