export class UserDTO {
  id: string;
  name: string;
  email: string;
  passwd: string;
  cpf: string;
}

export class CreateUserDTO {
  name: string;
  email: string;
  passwd: string;
  cpf: string;
}

export class UpdateUserDTO {
  name: string;
  email: string;
  passwd: string;
  cpf: string;
}
