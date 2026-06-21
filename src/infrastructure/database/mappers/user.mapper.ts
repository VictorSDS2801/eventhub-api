import { User } from '../../../domain/entities/user';
import { Email } from '../../../domain/entities/email.vo';
import { Role, RoleEnum } from '../../../domain/entities/role.vo';
import { UserDocument } from '../schemas/user.schema';

export class UserMapper {
  static toDomain(document: UserDocument): User {
    return User.restore({
      id: document.domainId,
      name: document.name,
      email: Email.create(document.email),
      passwordHash: document.passwordHash,
      role: Role.fromValue(document.role as RoleEnum),
      createdAt: document.createdAt,
    });
  }

  static toPersistence(user: User): Partial<UserDocument> {
    return {
      domainId: user.id,
      name: user.getName(),
      email: user.getEmail().getValue(),
      passwordHash: user.getPasswordHash(),
      role: user.getRole().getValue(),
      createdAt: user.createdAt,
    };
  }
}
