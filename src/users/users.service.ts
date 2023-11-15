import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(email: string, password: string) {
    const user = this.repo.create({ email: email, password: password });
    this.repo.save(user);
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  find(email: string) {
    return this.repo.find({ where: { email } });
  }

  // attribute:Partial<User> let us provide only a part of the entity we're updating
  async update(id: number, attribute: Partial<User>) {
    const userToUpdate = await this.findOne(id);

    if (!userToUpdate) {
      throw new Error('user not found');
    }

    //Assign properties in 'attribute' to userToUpdate
    Object.assign(userToUpdate, attribute);
    this.repo.save(userToUpdate);
  }

  //TODO remove() {}
}
