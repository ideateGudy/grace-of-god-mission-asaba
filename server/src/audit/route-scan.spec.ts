import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module.js';
import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModulesContainer } from '@nestjs/core/injector/modules-container.js';
import { PERMISSIONS_KEY } from '../auth/decorators/require-permissions.decorator.js';
import { SUPER_ADMIN_ONLY_KEY } from '../auth/decorators/super-admin-only.decorator.js';
import { IS_PUBLIC_KEY } from '../auth/decorators/public-route.decorator.js';

describe('Route Scan', () => {
  let app: INestApplication;
  let reflector: Reflector;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    reflector = app.get(Reflector);
  }, 60000);

  afterAll(async () => {
    await app.close();
  }, 30000);

  it('should have authorization decorators on all admin routes', () => {
    // Get all controllers and check their routes.
    // In NestJS, getting the actual route decorators from express router is tricky.
    // A better way is using the ModulesContainer to get all controllers and methods.
    const modulesContainer = app.get(ModulesContainer);
    const modules = [...modulesContainer.values()];

    const adminPathsWithoutAuth: string[] = [];

    modules.forEach((module) => {
      const controllers = [...module.controllers.values()];
      controllers.forEach((wrapper) => {
        const instance = wrapper.instance;
        if (!instance) return;

        const prototype = Object.getPrototypeOf(instance);
        const methodNames = Object.getOwnPropertyNames(prototype).filter(
          (method) => method !== 'constructor' && typeof prototype[method] === 'function'
        );

        methodNames.forEach((methodName) => {
          const handler = prototype[methodName];
          
          const pathMeta = Reflect.getMetadata('path', handler);
          const controllerPath = Reflect.getMetadata('path', prototype.constructor);
          
          if (!controllerPath) return;

          const fullPath = `/${controllerPath}${pathMeta ? '/' + pathMeta : ''}`.replace(/\/+/g, '/');

          if (fullPath.startsWith('/admin') || controllerPath === 'admin') {
            const isPublic = reflector.getAllAndOverride(IS_PUBLIC_KEY, [handler, prototype.constructor]);
            if (isPublic) return;

            const hasPermissions = reflector.getAllAndOverride(PERMISSIONS_KEY, [handler, prototype.constructor]);
            const isSuperAdminOnly = reflector.getAllAndOverride(SUPER_ADMIN_ONLY_KEY, [handler, prototype.constructor]);

            if (!hasPermissions && !isSuperAdminOnly) {
              adminPathsWithoutAuth.push(`${prototype.constructor.name}.${methodName} (${fullPath})`);
            }
          }
        });
      });
    });

    expect(adminPathsWithoutAuth).toEqual([]);
  });
});
