import {
  Unique,
  Entity,
  Column,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Unique(['email'])
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ length: 20 })
  username: string;
}

@Entity()
@Unique(['firstname', 'lastname'])
export class Child {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  creatorId: number;

  @ManyToMany(() => ChildCare, (childCare) => childCare.children)
  @JoinTable()
  childCares: ChildCare[];
}

@Entity()
export class ChildCare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  creatorId: number;

  @ManyToMany(() => Child, (child) => child.childCares)
  children: Child[];
}
