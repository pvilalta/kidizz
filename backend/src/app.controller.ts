import {
  Get,
  Put,
  Body,
  Res,
  Post,
  Param,
  Delete,
  Headers,
  Controller,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';

import { AppService } from './app.service';
import { UserUpsertDto, ChildCareCreateDto, ChildUpsertDto } from './app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/user/:username')
  async getUserByUsername(
    @Res() res: Response,
    @Param('username') username: string,
  ): Promise<void> {
    try {
      const user = await this.appService.getUserById(username);
      res.status(HttpStatus.OK).json(user);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  @Put('/user')
  async upsertUser(
    @Res() res: Response,
    @Body() body: UserUpsertDto,
  ): Promise<void> {
    try {
      const userId = await this.appService.upsertUser(body);
      res.status(HttpStatus.OK).json({ id: userId });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  @Get('/child-cares')
  async getChildCares(@Res() res: Response): Promise<void> {
    try {
      const childCares = await this.appService.getChildCares();
      res.status(HttpStatus.OK).json(childCares);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  @Post('/child-care')
  async createChildCare(
    @Res() res: Response,
    @Body() body: ChildCareCreateDto,
    @Headers('X-Auth') username: string,
  ): Promise<void> {
    try {
      const childCareId = await this.appService.createChildCare(username, body);
      res.status(HttpStatus.CREATED).json({ id: childCareId });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  @Delete('/child-care/:id')
  async deleteChildCare(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Headers('X-Auth') username: string,
  ): Promise<void> {
    try {
      await this.appService.deleteChildCare(username, id);
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  @Get('/child-care/:id/children')
  async getChildrenFromChildCare(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    try {
      const children = await this.appService.getChildrenFromChildCare(id);
      res.status(HttpStatus.CREATED).json({ children });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  @Get('/children')
  async getChildren(@Res() res: Response): Promise<void> {
    try {
      const children = await this.appService.getChildren();
      res.status(HttpStatus.OK).json({ children });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  @Post('/child')
  async upsertChild(
    @Res() res: Response,
    @Body() body: ChildUpsertDto,
    @Headers('X-Auth') username: string,
  ): Promise<void> {
    try {
      const childCareId = await this.appService.upsertChild(username, body);
      res.status(HttpStatus.CREATED).json({ id: childCareId });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  @Delete('/child-care/:childCareId/child/:childId')
  async deleteChildFromChildCare(
    @Res() res: Response,
    @Param('childId', ParseIntPipe) childId: number,
    @Param('childCareId', ParseIntPipe) childCareId: number,
    @Headers('X-Auth') username: string,
  ): Promise<void> {
    try {
      await this.appService.deleteChildFromChildCare(
        childId,
        childCareId,
        username,
      );
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      console.log('error.message', error.message);
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  @Get('/children/export.csv/:childCareId?')
  async getChildrenExport(
    @Res() res: Response,
    @Param('childCareId') childCareId: string,
  ): Promise<void> {
    try {
      const id = childCareId ? parseInt(childCareId, 10) : null;
      await this.appService.getChildrenExport(res, id);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }
}
