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
            repositoryName: {type: 'string'}
          },
          required: ['modelName','repositoryName'],
          
        },
      },
    },
  })
  body: {modelName: string , repositoryName: string},
): Promise<object> {
  let deliver = await this.deliverRepository.findOne({
    where: {modelName: body.modelName},
  });

  if (!deliver) {
    deliver = await this.deliverRepository.create({modelName: body.modelName , repositoryName:body.repositoryName});
  }
  return {id: deliver.id, modelName: deliver.modelName, repositoryName: deliver.repositoryName};
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


@get('/deliver/{id}/fields/{flag}')
async getModelFields(
  @param.path.string('id') id: string,
  @param.path.boolean('flag') flag: boolean
) {
  const deliver = await this.deliverRepository.findById(id).catch(() => null);
  if (!deliver) return { error: 'Model not found' };

  const { modelName } = deliver;

  let ModelModule;
  let ModelClass;

  // Helper to convert PascalCase to kebab-case
  const toKebabCase = (str: string) =>
    str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

  const fileName = toKebabCase(modelName); // ProductionNaukri → production-naukri

  try {
    // Import using kebab-case filename
    ModelModule = await import(`../models/${fileName}.model`);
    // Get class by exact name or fallback to first export
    ModelClass = ModelModule?.[modelName] || Object.values(ModelModule)[0];
  } catch (err) {
    console.error("Error importing model:", err);
    return { error: `Cannot import model file for '${modelName}'` };
  }

  if (!ModelClass?.definition?.properties) {
    return { error: `Fields not found for model '${modelName}'` };
  }

  const ignoreFields = flag ? [] : ['createdAt', 'updatedAt', 'isDeleted', 'deletedAt','scrappedAt', 'id'];

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
