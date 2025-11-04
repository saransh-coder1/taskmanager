import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

interface Task {
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'done';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: Date;
  dueDate?: string;
  editing?: boolean;
  showStatusDropdown?: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  newTaskTitle = '';
  newTaskDescription = '';
  newTaskPriority: 'Low' | 'Medium' | 'High' = 'Low';
  newTaskDueDate = '';

  todo: Task[] = [];
  inProgress: Task[] = [];
  done: Task[] = [];

  filterPriority = '';
  sortOption = '';
  filterCreatedDate = '';
  filterDueDate = '';

  
  private allTasks: Task[] = [];

 
  logout() {
    console.log('Logout clicked');
  }

 
  addTask() {
    if (!this.newTaskTitle.trim()) return;

    const newTask: Task = {
      title: this.newTaskTitle.trim(),
      description: this.newTaskDescription.trim(),
      priority: this.newTaskPriority,
      dueDate: this.newTaskDueDate || '',
      createdAt: new Date(),
      status: 'todo'
    };

   
    this.allTasks.push(newTask);
    
   
    localStorage.setItem('tasks', JSON.stringify(this.allTasks));

 
    this.newTaskTitle = '';
    this.newTaskDescription = '';
    this.newTaskPriority = 'Low';
    this.newTaskDueDate = '';
    
    
    this.loadTasks();
  }

  editTask(task: Task) {
    task.editing = true;
  }

  saveEdit(task: Task) {
    task.editing = false;
    
   
    const index = this.allTasks.findIndex(t => t === task);
    if (index !== -1) {
      this.allTasks[index] = { ...task };
    }
    
  
    localStorage.setItem('tasks', JSON.stringify(this.allTasks));
    
    this.loadTasks();
  }

  cancelEdit(task: Task) {
    task.editing = false;
    this.loadTasks();
  }

 
  deleteTask(task: Task) {
    
    this.allTasks = this.allTasks.filter(t => t !== task);
    
   
    localStorage.setItem('tasks', JSON.stringify(this.allTasks));
    
  
    this.loadTasks();
  }

  
  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedTask = event.previousContainer.data[event.previousIndex];

      if (event.container.id.includes('todo')) movedTask.status = 'todo';
      else if (event.container.id.includes('inProgress')) movedTask.status = 'inProgress';
      else if (event.container.id.includes('done')) movedTask.status = 'done';

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
     
      const taskIndex = this.allTasks.findIndex(t => t === movedTask);
      if (taskIndex !== -1) {
        this.allTasks[taskIndex] = { ...movedTask };
      }
      
      
      localStorage.setItem('tasks', JSON.stringify(this.allTasks));
    }
    
   
    this.loadTasks();
  }

  
  changeStatus(task: Task, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value as 'todo' | 'inProgress' | 'done';
    if (!newStatus) return;

    task.status = newStatus;
    this.moveTask(task, newStatus);
    this.loadTasks();
  }

  
  moveTask(task: Task, newStatus: 'todo' | 'inProgress' | 'done') {
  
    this.todo = this.todo.filter(t => t !== task);
    this.inProgress = this.inProgress.filter(t => t !== task);
    this.done = this.done.filter(t => t !== task);

   
    if (newStatus === 'todo') this.todo.push(task);
    if (newStatus === 'inProgress') this.inProgress.push(task);
    if (newStatus === 'done') this.done.push(task);
   
    this.loadTasks();
  }

 
  sortTasks() {
    
    this.loadTasks();
  }

  loadTasks() {
    
    if (this.allTasks.length === 0) {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        this.allTasks = JSON.parse(savedTasks);
      }
    }

    
    let filtered = [...this.allTasks];

    if (this.filterPriority) {
      filtered = filtered.filter(t => t.priority === this.filterPriority);
    }

  
    if (this.sortOption === 'createdAt' && this.filterCreatedDate) {
      const filterDate = new Date(this.filterCreatedDate);
      filterDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.createdAt);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === filterDate.getTime();
      });
    } else if (this.sortOption === 'dueDate' && this.filterDueDate) {
      const filterDate = new Date(this.filterDueDate);
      filterDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === filterDate.getTime();
      });
    }

  
    if (this.sortOption === 'createdAt') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (this.sortOption === 'dueDate') {
      filtered.sort((a, b) => {
        const ta = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const tb = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return ta - tb;
      });
    }

   
    this.todo = filtered.filter(t => t.status === 'todo');
    this.inProgress = filtered.filter(t => t.status === 'inProgress');
    this.done = filtered.filter(t => t.status === 'done');
  }
}
