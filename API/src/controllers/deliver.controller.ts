import {inject} from '@loopback/core';
import {
  get,
  param,
  post,
  requestBody,
} from '@loopback/rest';
import {repository} from '@loopback/repository';
import {DeliverRepository} from '../repositories';
import { Deliver } from '../models';

export class DeliverController {
  constructor(
    @repository(DeliverRepository)
    public deliverRepository: DeliverRepository,
  ) {}


@post('/deliver/model')
async createOrFetchDeliver(
  @requestBody({
    description: 'Provide modelName',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            modelName: {type: 'string'},
          },
          required: ['modelName'],
        },
      },
    },
  })
  body: {modelName: string},
): Promise<object> {
  let deliver = await this.deliverRepository.findOne({
    where: {modelName: body.modelName},
  });

  if (!deliver) {
    deliver = await this.deliverRepository.create({modelName: body.modelName});
  }
  return {id: deliver.id, modelName: deliver.modelName};
}



// @get('/deliver/model/{id}')
//   async getModel(
//     @param.path.string('id') id: string,
//   ): Promise<object> {
//     const deliver: Deliver | null = await this.deliverRepository.findById(id);

//     if (!deliver) {
//       return {error: 'Deliver not found'};
//     }

//     return {
//       id: deliver.id,
//       modelName: deliver.modelName,
//     };
//   }

    @get('/deliver')
  async findAll(): Promise<Deliver[]> {
    return this.deliverRepository.find();
  }


 @get('/deliver/{id}/fields')
async getModelFields(@param.path.string('id') id: string) {
  const deliver = await this.deliverRepository.findById(id).catch(() => null);
  if (!deliver) return { error: 'Model not found' };

  const { modelName } = deliver;

  // Dynamic import
  const ModelModule = await import(`../models/${modelName.toLowerCase()}.model`);
  const ModelClass = ModelModule?.[modelName];

  if (!ModelClass?.definition?.properties) {
    return { error: `Fields not found for model '${modelName}'` };
  }

  // Fields to ignore
  const ignoreFields = ['createdAt', 'updatedAt', 'isDeleted', 'deletedAt'];

  // Map properties to objects with name and type
  const fields = Object.entries(ModelClass.definition.properties)
    .filter(([key]) => !ignoreFields.includes(key))
    .map(([key, value]: any) => ({
      name: key,
      type: value.type || 'string',
    }));

  return {
    id: deliver.id,
    modelName,
    fields,
  };
}




 
  @get('/deliver/api/{apiEndpoint}/methods')
  async getApiMethods(
    @param.path.string('apiEndpoint') apiEndpoint: string,
  ): Promise<string[]> {

    return ['POST', 'GET', 'PATCH', 'PUT'];
  }

  @post('/deliver/submit')
  async submitMapping(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              mode: {type: 'string'},
              target: {type: 'string'},
              method: {type: 'string'},
              fields: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    fieldName: {type: 'string'},
                    selectorType: {type: 'string'},
                    mappedFrom: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    })
    body: any,
  ): Promise<object> {
    // Here you can save mapping in DB or call API
    console.log('Mapping Submitted:', body);

    return {success: true, data: body};
  }
}
