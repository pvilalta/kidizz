export type UserCreateInput = {
  username: string;
  email: string;
};

export type User = UserCreateInput & {
  id: number;
};

export type ChildCareCreateInput = {
  name: string;
};

export type ChildCare = ChildCareCreateInput & {
  id: number;
  creatorId: number;
};

export type ChildCreateInput = {
  firstname: string;
  lastname: string;
  childCares?: number[];
};

export type Children = ChildCreateInput & {
  id: number;
  creatorId: number;
};

export type ChildCareDeleteInput = {
  childId: number;
  childCareId: number;
};
