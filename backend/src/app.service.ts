import { Readable } from 'stream';
import { Response } from 'express';
import { Repository, In } from 'typeorm';
import { stringify } from 'csv-stringify';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { sendEmailToUsers } from './utils';
import { User, ChildCare, Child } from './app.entity';
import { UserUpsertDto, ChildCareCreateDto, ChildUpsertDto } from './app.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Child)
    private readonly childRepository: Repository<Child>,
    @InjectRepository(ChildCare)
    private readonly childCareRepository: Repository<ChildCare>,
  ) {}

  async getUserById(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new Error('No user found');
    return user;
  }

  async upsertUser(body: UserUpsertDto): Promise<number> {
    let user = await this.userRepository.findOne({
      where: { email: body.email },
    });

    const userWithSameName = await this.userRepository.findOne({
      where: {
        username: body.username,
      },
    });

    if (user) {
      if (userWithSameName && userWithSameName.id !== user.id) {
        throw new Error('Username already taken');
      }
      user.username = body.username.trim() || user.username;
      await this.userRepository.save(user);
    } else {
      if (userWithSameName) throw new Error('Username already taken');
      user = await this.userRepository.save({
        email: body.email.trim(),
        username: body.username.trim(),
      });
    }
    return user.id;
  }

  async getChildCares(): Promise<ChildCare[]> {
    const childCare = await this.childCareRepository.find({});
    if (!childCare) throw new Error('No child cares found');
    return childCare;
  }

  async createChildCare(
    username: string,
    body: ChildCareCreateDto,
  ): Promise<number> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new Error('User not found');

    const existingChildCare = await this.childCareRepository.findOne({
      where: { name: body.name.trim() },
    });
    if (existingChildCare) throw new Error('Child care already exists');

    const childCare = await this.childCareRepository.save({
      name: body.name.trim(),
      creatorId: user.id,
    });
    return childCare.id;
  }

  async deleteChildCare(username: string, id: number): Promise<number> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new Error('User not found');

    const childCare = await this.childCareRepository.findOne({
      where: {
        id,
      },
      relations: ['children'],
    });

    if (!childCare) {
      throw new Error('ChildCare not found');
    } else if (childCare.creatorId !== user.id) {
      throw new Error('Unauthorized to delete this childCare');
    }

    const usersToInform = childCare.children
      .filter((user) => user.creatorId !== childCare.creatorId)
      .map((user) => user.creatorId);

    const usersItems = await this.userRepository.find({
      where: {
        id: In(usersToInform),
      },
    });

    await sendEmailToUsers(usersItems, { batchSize: 3 });

    await this.childCareRepository.remove(childCare);
    return;
  }

  async getChildren(): Promise<Child[]> {
    const children = await this.childRepository.find({
      relations: ['childCares'],
    });
    return children;
  }

  async getChildrenFromChildCare(id: number): Promise<Child[]> {
    const childCare = await this.childCareRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!childCare) throw new Error('No child care found');
    return childCare?.children;
  }

  async upsertChild(username: string, body: ChildUpsertDto): Promise<number> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new Error('User not found');

    const childExists = await this.childRepository.findOne({
      where: {
        firstname: body.firstname.trim(),
        lastname: body.lastname.trim(),
      },
      relations: ['childCares'],
    });

    let childCaresToAdd: ChildCare[] = [];
    if (body.childCares?.length > 0) {
      childCaresToAdd = await this.childCareRepository.find({
        where: {
          id: In(body.childCares),
        },
      });
      if (childCaresToAdd.length !== body.childCares.length) {
        throw new Error('Some child cares do not exist');
      }
    }

    if (childExists) {
      childExists.childCares = childExists.childCares.concat(childCaresToAdd);
      await this.childRepository.save(childExists);
      return childExists.id;
    } else {
      const child = await this.childRepository.save({
        creatorId: user.id,
        firstname: body.firstname.trim(),
        lastname: body.lastname.trim(),
        childCares: childCaresToAdd,
      });
      return child.id;
    }
  }

  async deleteChildFromChildCare(
    childId: number,
    childCareId: number,
    username: string,
  ): Promise<number> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new Error('User not found');

    const child = await this.childRepository.findOne({
      where: {
        id: childId,
      },
      relations: ['childCares'],
    });

    if (!child) {
      throw new Error('Child not found');
    } else if (child.creatorId !== user.id) {
      throw new Error('Unauthorized to delete this child');
    }

    child.childCares = child.childCares.filter(
      (childCare) => childCare.id !== childCareId,
    );

    if (!child.childCares.length) await this.childRepository.remove(child);
    else await this.childRepository.save(child);
    return;
  }

  async getChildrenExport(
    res: Response,
    childCareId: number | null,
  ): Promise<any> {
    const children = await this.childCareRepository
      .createQueryBuilder('childCare')
      .innerJoin('childCare.children', 'child')
      .select([
        'child.id as id',
        'child.firstname as firstname',
        'child.lastname as lastname',
        'child.creatorId as creatorId',
      ])
      .where(childCareId ? 'childCare.id = :childCareId' : '1=1', {
        childCareId,
      })
      .groupBy('child.id')
      .orderBy('child.lastname', 'ASC')
      .getRawMany();

    const childStream = Readable.from(children, { objectMode: true });

    const csvStream = stringify({
      header: true,
      columns: ['id', 'firstname', 'lastname', 'creatorId'],
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="children.csv"');

    childStream.pipe(csvStream).pipe(res);

    csvStream.on('error', (err) =>
      res.status(500).send({ message: err.message }),
    );

    res.on('finish', () => {
      console.log('CSV file successfully sent to client.');
    });
  }
}
