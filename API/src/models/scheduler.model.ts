import {Entity, model, property} from '@loopback/repository';

@model()
export class Scheduler extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;
  
  @property({
    type:'string',

  })
  schedularName: string

  @property({
    type:'string',

  })
  schedulerType: string

  @property({
    type:'string',

  })
  schedulerFor: string

    @property({
    type: 'string',
 
  })
  interval?: string;

  @property({
    type: 'date', 
  })
  date?: Date;

  @property({
    type: 'string',
  })
  time?: string;

    @property({
      type: 'date',
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


  constructor(data?: Partial<Scheduler>) {
    super(data);
  }
}

export interface SchedulerRelations {
  // describe navigational properties here
}

export type SchedulerWithRelations = Scheduler & SchedulerRelations;
