import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TaskService } from './task.service';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';
import { Task } from '../models/task.model';
import { Observable, interval, switchMap, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskReminderService {
  private apiUrl = 'http://localhost:8080/api/tasks';
  private reminderInterval = 60000; // Check every minute
  private sentReminders = new Set<number>(); // Track tasks that already had reminders sent

  constructor(
    private http: HttpClient,
    private taskService: TaskService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  startReminderService(): void {
    // Only start if user is authenticated
    if (!this.authService.isAuthenticated()) {
      return;
    }

    interval(this.reminderInterval)
      .pipe(
        filter(() => this.authService.isAuthenticated()),
        switchMap(() => this.taskService.getPendingTasks())
      )
      .subscribe({
        next: (tasks) => {
          this.checkTasksForReminders(tasks);
        },
        error: (error) => {
          console.error('Error checking task reminders:', error);
        }
      });
  }

  private checkTasksForReminders(tasks: Task[]): void {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    tasks.forEach(task => {
      if (task.dueDate && task.id && !task.reminderSent) {
        const dueDate = new Date(task.dueDate);
        
        // Check if task is due within 24 hours
        if (dueDate <= oneDayFromNow && dueDate > now) {
          const millisecondsUntilDue = dueDate.getTime() - now.getTime();
          const hoursUntilDue = Math.max(1, Math.ceil(millisecondsUntilDue / (1000 * 60 * 60)));
          const minutesUntilDue = Math.ceil(millisecondsUntilDue / (1000 * 60));
          
          // Show popup notification
          this.notificationService.addNotification({
            title: 'Task Due Soon!',
            message: this.formatRemainingTime(millisecondsUntilDue, task.title),
            type: 'warning',
            taskId: task.id
          });

          // Send email reminder
          this.sendEmailReminder(task, millisecondsUntilDue);
        }
      }
    });
  }

  private formatRemainingTime(millisecondsUntilDue: number, taskTitle: string): string {
    const hoursUntilDue = Math.floor(millisecondsUntilDue / (1000 * 60 * 60));
    const minutesUntilDue = Math.floor((millisecondsUntilDue % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursUntilDue > 0) {
      if (minutesUntilDue > 0) {
        return `"${taskTitle}" is due in ${hoursUntilDue} hour(s) and ${minutesUntilDue} minute(s)`;
      } else {
        return `"${taskTitle}" is due in ${hoursUntilDue} hour(s)`;
      }
    } else {
      return `"${taskTitle}" is due in ${minutesUntilDue} minute(s)`;
    }
  }
  private sendEmailReminder(task: Task, millisecondsUntilDue: number): void {
    const hoursUntilDue = Math.floor(millisecondsUntilDue / (1000 * 60 * 60));
    const minutesUntilDue = Math.floor((millisecondsUntilDue % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeRemaining: string;
    if (hoursUntilDue > 0) {
      if (minutesUntilDue > 0) {
        timeRemaining = `${hoursUntilDue} hour(s) and ${minutesUntilDue} minute(s)`;
      } else {
        timeRemaining = `${hoursUntilDue} hour(s)`;
      }
    } else {
      timeRemaining = `${minutesUntilDue} minute(s)`;
    }

    const reminderData = {
      taskId: task.id,
      taskTitle: task.title,
      taskDescription: task.description,
      dueDate: task.dueDate,
      timeRemaining: timeRemaining
    };

    this.http.post(`${this.apiUrl}/send-reminder`, reminderData, this.getHttpOptions())
      .subscribe({
        next: () => {
          console.log(`Email reminder sent for task: ${task.title}`);
        },
        error: (error) => {
          console.error('Failed to send email reminder:', error);
        }
      });
  }

  private getHttpOptions() {
    const token = this.authService.getToken();
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
  }
}