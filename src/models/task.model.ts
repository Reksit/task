export interface Task {
  id?: number;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'COMPLETED';
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: number;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: Date;
}