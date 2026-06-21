import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../../domain/entities/user';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserDocument, UserSchemaClass } from '../schemas/user.schema';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserSchemaClass.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async save(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);

    const updated = await this.userModel.findOneAndUpdate(
      { domainId: user.id },
      { $set: data },
      { upsert: true, new: true },
    );

    return UserMapper.toDomain(updated);
  }

  async findById(id: string): Promise<User | null> {
    const document = await this.userModel.findOne({ domainId: id });
    return document ? UserMapper.toDomain(document) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const document = await this.userModel.findOne({
      email: email.toLowerCase(),
    });
    return document ? UserMapper.toDomain(document) : null;
  }
}
