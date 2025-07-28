import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { CreateTaskRequest } from '../../models/task.model';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="create-task-container">
  <nav class="navbar">
    <div class="container">
      <div class="nav-content">
        <div class="nav-brand">TaskManager Pro</div>
        <div class="nav-links">
          <button class="btn btn-outline-primary back-btn" (click)="goBack()">
            <span class="icon">←</span> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  </nav>


      <div class="container">
        <div class="create-task-wrapper">
          <div class="create-task-card card">
            <div class="card-header">
              <h1 class="card-title">Create New Task</h1>
              <p class="card-subtitle">Fill in the details to create a new task</p>
            </div>

            <form (ngSubmit)="onSubmit()" #taskForm="ngForm" class="task-form">
              <div class="form-group">
                <label for="title">Task Title *</label>
                <input
                  type="text"
                  id="title"
                  class="form-control"
                  [(ngModel)]="taskData.title"
                  name="title"
                  required
                  maxlength="100"
                  placeholder="Enter task title"
                />
                <div class="field-hint">
                  {{ taskData.title.length }}/100 characters
                </div>
              </div>

              <div class="form-group">
                <label for="description">Description *</label>
                <textarea
                  id="description"
                  class="form-control"
                  [(ngModel)]="taskData.description"
                  name="description"
                  required
                  rows="4"
                  maxlength="500"
                  placeholder="Describe your task in detail"
                ></textarea>
                <div class="field-hint">
                  {{ taskData.description.length }}/500 characters
                </div>
              </div>

              <div class="form-group">
                <label for="priority">Priority *</label>
                <select
                  id="priority"
                  class="form-control"
                  [(ngModel)]="taskData.priority"
                  name="priority"
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
              </div>

              <div class="form-group">
                <label for="dueDate">Due Date</label>
                <input
                  type="datetime-local"
                  id="dueDate"
                  class="form-control"
                  [(ngModel)]="dueDateString"
                  name="dueDate"
                  [min]="minDate"
                />
               
              </div>

              <div *ngIf="errorMessage" class="error-message">
                {{ errorMessage }}
              </div>

              <div *ngIf="successMessage" class="success-message">
                {{ successMessage }}
              </div>

              <div class="form-actions">
                <button
                  type="button"
                  class="btn-secondary"
                  (click)="goBack()"
                  [disabled]="isLoading"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn-primary"
                  [disabled]="!taskForm.valid || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner"></span>
                  {{ isLoading ? 'Creating...' : 'Create Task' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-task-container {
      min-height: 100vh;
      background: black;
      position: relative;
      overflow: hidden;
    }

    .create-task-container::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="1" fill="white" opacity="0.8"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite"/></circle><circle cx="80" cy="30" r="0.5" fill="white" opacity="0.6"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="4s" repeatCount="indefinite"/></circle><circle cx="40" cy="60" r="0.8" fill="white" opacity="0.7"><animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.5s" repeatCount="indefinite"/></circle><circle cx="70" cy="80" r="0.6" fill="white" opacity="0.5"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="3.5s" repeatCount="indefinite"/></circle><circle cx="10" cy="70" r="0.4" fill="white" opacity="0.8"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/></circle><circle cx="90" cy="10" r="0.7" fill="white" opacity="0.6"><animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.8s" repeatCount="indefinite"/></circle><circle cx="30" cy="90" r="0.5" fill="white" opacity="0.7"><animate attributeName="opacity" values="0.7;0.1;0.7" dur="3.2s" repeatCount="indefinite"/></circle><circle cx="60" cy="40" r="0.6" fill="white" opacity="0.5"><animate attributeName="opacity" values="0.5;0.3;0.5" dur="2.7s" repeatCount="indefinite"/></circle></svg>') repeat;
      pointer-events: none;
      z-index: 1;
      animation: twinkle 10s linear infinite;
    }

    @keyframes twinkle {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .navbar {
      background: rgba(20, 20, 30, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      z-index: 10;
    }

    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .back-btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #64ffda;
  border: 1px solid #64ffda;
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background-color: #64ffda;
  color: #1a1a2e;
}

.back-btn .icon {
  margin-right: 6px;
  font-weight: bold;
}


    .create-task-wrapper {
      padding: 30px 0;
      display: flex;
      justify-content: center;
      position: relative;
      z-index: 10;
    }

    .create-task-card {
      width: 100%;
      max-width: 600px;
      padding: 40px;
      background: rgba(30, 30, 45, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .card-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .card-title {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
    }

    .card-subtitle {
      color: #b0b0b0;
      font-size: 16px;
      margin: 0;
    }

    .task-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .form-control {
      padding: 12px 15px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      font-size: 16px;
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      transition: all 0.3s ease;
      resize: vertical;
    }

    .form-control::placeholder {
      color: #888;
    }

    .form-control:focus {
      outline: none;
      border-color: #64ffda;
      box-shadow: 0 0 0 3px rgba(100, 255, 218, 0.1);
    }

    .form-control select {
      cursor: pointer;
    }

    .field-hint {
      font-size: 12px;
      color: #888;
      margin-top: 5px;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
    }

    .form-actions button {
      padding: 12px 25px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      min-width: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .form-actions button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, #64ffda 0%, #00bcd4 100%);
      color: #1a1a2e;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(100, 255, 218, 0.4);
    }

    .btn-secondary {
      background: #ff6b6b;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #ff5252;
      transform: translateY(-2px);
    }

    .error-message {
      color: #ff6b6b;
      font-size: 14px;
      padding: 10px 15px;
      background: rgba(255, 107, 107, 0.1);
      border: 1px solid rgba(255, 107, 107, 0.3);
      border-radius: 6px;
    }

    .success-message {
      color: #51cf66;
      font-size: 14px;
      padding: 10px 15px;
      background: rgba(81, 207, 102, 0.1);
      border: 1px solid rgba(81, 207, 102, 0.3);
      border-radius: 6px;
    }

    textarea.form-control {
      min-height: 100px;
    }

    @media (max-width: 768px) {
      .create-task-card {
        padding: 20px;
        margin: 0 15px;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class CreateTaskComponent {
  taskData: CreateTaskRequest = {
    title: '',
    description: '',
    priority: 'MEDIUM'
  };

  dueDateString = '';
  minDate = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private taskService: TaskService,
    private router: Router
  ) {
    this.setMinDate();
  }

  private setMinDate(): void {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.minDate = now.toISOString().slice(0, 16);
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Convert date string to Date object if provided
    if (this.dueDateString) {
      this.taskData.dueDate = new Date(this.dueDateString);
    }

    this.taskService.createTask(this.taskData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Task created successfully!';
        
        // Navigate back to dashboard after short delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create task. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}