

export interface IUser {
  id: string;
  name: string
  email: string;
  password?: string;
  username: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}