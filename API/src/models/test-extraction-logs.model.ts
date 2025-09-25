import { Entity, model, property } from '@loopback/repository';

@model()
export class TestExtractionLogs extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true
  })
  extractionId: string;

  @property({
    type: 'string',
    required: true
  })
  logsDescription: string;

  @property({
    type: 'number',
    required: true
  })
  logType: number;  // 0 => Info, 1 => error, 2 => success, 3 => warning

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @property({
    type: 'date',
  })
  deletedAt?: Date;

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted: boolean;

  @property({
    type: 'boolean',
    required: true,
    default: true,
  })
  isActive: boolean;

  @property({
    type: 'string',
  })
  remark?: string;
  constructor(data?: Partial<TestExtractionLogs>) {
    super(data);
  }
}

export interface TestExtractionLogsRelations {
  // describe navigational properties here
}

export type TestExtractionLogsWithRelations = TestExtractionLogs & TestExtractionLogsRelations;
