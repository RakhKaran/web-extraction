
import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { CronComponent } from '@loopback/cron';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import { ServiceMixin } from '@loopback/service-proxy';
import multer from 'multer';
import path from 'path';

import { JWTStrategy } from './authentication-strategy/jwt-strategy';
import {
  EmailManagerBindings,
  FILE_UPLOAD_SERVICE,
  STORAGE_DIRECTORY,
} from './keys';
import { MySequence } from './sequence';
import { EmailService } from './services/email.service';
import { BcryptHasher } from './services/hash.password.bcrypt';
import { JWTService } from './services/jwt-service';
import { MyUserService } from './services/user-service';
import { Main } from './services/nodes/main.service';
import { AirflowDagService } from './services/nodes/dag-creation.service';
import { Initialize } from './services/nodes/initialize.service';
import { Search } from './services/nodes/search.service';
import { Locate } from './services/nodes/locate.service';
import { Deliver } from './services/nodes/deliver.service';
import { Transformation } from './services/nodes/transformation.service';

export { ApplicationConfig };

export class WebExtractionApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.sequence(MySequence);

    this.setUpBinding();
    this.component(AuthenticationComponent);
    this.component(CronComponent);

    this.configureFileUpload(options.fileStorageDirectory);
    registerAuthenticationStrategy(this, JWTStrategy);

    this.static('/', path.join(__dirname, '../public'));

    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  setUpBinding(): void {
    this.bind('service.hasher').toClass(BcryptHasher);
    this.bind('service.jwt.service').toClass(JWTService);
    this.bind('service.user.service').toClass(MyUserService);
    this.bind(EmailManagerBindings.SEND_MAIL).toClass(EmailService);
    // nodes service
    this.bind('services.DagCreation').toClass(AirflowDagService);
    this.bind('services.Main').toClass(Main);
    this.bind('services.Initialize').toClass(Initialize);
    this.bind('services.Search').toClass(Search);
    this.bind('services.Locate').toClass(Locate);
    this.bind('services.Deliver').toClass(Deliver);
    this.bind('services.Transformation').toClass(Transformation);
  }

  protected configureFileUpload(destination?: string) {
    destination = destination ?? path.join(__dirname, '../.sandbox');
    this.bind(STORAGE_DIRECTORY).to(destination);

    const multerOptions: multer.Options = {
      storage: multer.diskStorage({
        destination,
        filename: (req, file, cb) => {
          const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
          const fileName = `${timestamp}_${file.originalname}`;
          cb(null, fileName);
        },
      }),
    };

    this.configure(FILE_UPLOAD_SERVICE).to(multerOptions);
  }
}
