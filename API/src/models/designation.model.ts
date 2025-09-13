import {Entity, model, property} from '@loopback/repository';

@model()
export class Designation extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

@property({
  type:'string',
})
designation?:string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'boolean',
    required: true,
  })
  isActive: boolean;

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

  constructor(data?: Partial<Designation>) {
    super(data);
  }
}

export interface DesignationRelations {
  // describe navigational properties here
}

export type DesignationWithRelations = Designation & DesignationRelations;
