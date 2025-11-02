
import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface Task {
  id: number;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'todo' | 'inProgress' | 'done';
  createdAt: string;
  dueDate?: string;
  editing?: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  todo: Task[] = [];
  inProgress: Task[] = [];
  done: Task[] = [];

  newTaskTitle = '';
  newTaskPriority: 'Low' | 'Medium' | 'High' = 'Low';
  newTaskDueDate = '';

  filterPriority = '';
  sortOption = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadTasks();
  }

  addTask() {
    if (!this.newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      title: this.newTaskTitle,
      priority: this.newTaskPriority,
      dueDate: this.newTaskDueDate || '',
      createdAt: new Date().toISOString(),
      status: 'todo'
    };
    this.todo.push(newTask);
    this.newTaskTitle = '';
    this.newTaskDueDate = '';
    this.saveTasks();
  }

  deleteTask(task: Task) {
    this.todo = this.todo.filter(t => t.id !== task.id);
    this.inProgress = this.inProgress.filter(t => t.id !== task.id);
    this.done = this.done.filter(t => t.id !== task.id);
    this.saveTasks();
  }

  editTask(task: Task) {
    task.editing = true;
  }

  saveEdit(task: Task) {
    task.editing = false;
    this.saveTasks();
  }

  cancelEdit(task: Task) {
    task.editing = false;
    this.loadTasks();
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    this.saveTasks();
  }

  saveTasks() {
    const allTasks = [
      ...this.todo.map(t => ({ ...t, status: 'todo' })),
      ...this.inProgress.map(t => ({ ...t, status: 'inProgress' })),
      ...this.done.map(t => ({ ...t, status: 'done' }))
    ];
    localStorage.setItem('tasks', JSON.stringify(allTasks));
  }

  loadTasks() {
    const allTasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]');
    const filtered = this.filterPriority ? allTasks.filter(t => t.priority === this.filterPriority) : allTasks;

    const sorted = [...filtered];
    if (this.sortOption === 'createdAt') {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (this.sortOption === 'dueDate') {
      sorted.sort((a, b) => new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime());
    }

    this.todo = sorted.filter(t => t.status === 'todo');
    this.inProgress = sorted.filter(t => t.status === 'inProgress');
    this.done = sorted.filter(t => t.status === 'done');
  }

  sortTasks() {
    this.loadTasks();
  }

  logout() {
    this.auth.logout();
  }
}
