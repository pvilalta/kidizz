import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { User, ChildCare, Child } from './app.entity';
import { AuthMiddleware } from './middlewares/authentication';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite3',
      synchronize: true,
      logging: false,
      entities: ['dist/**/*.entity.js'],
    }),
    TypeOrmModule.forFeature([User, ChildCare, Child]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      { path: 'child', method: RequestMethod.POST },
      { path: 'child-care', method: RequestMethod.POST },
      { path: 'child-care/:id', method: RequestMethod.DELETE },
      {
        path: '/child-care/:childCareId/child/:childId',
        method: RequestMethod.DELETE,
      },
    );
  }
}
