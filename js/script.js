'use strict';

class ToDo {
  constructor(form, input, todoList, todoCompleted) {
    this.form = document.querySelector(form);
    this.input = document.querySelector(input);
    this.todoList = document.querySelector(todoList);
    this.todoCompleted = document.querySelector(todoCompleted);
    this.todoData = new Map(JSON.parse(localStorage.getItem('todoList')));
  }

  addToStorage() {
    localStorage.setItem('todoList', JSON.stringify([...this.todoData]));
  }

  addTodo(e) {
    e.preventDefault();

    if (this.input.value.trim()) {
      const newTodo = {
        value: this.input.value,
        completed: false,
        key: this.generateKey(),
      };
      this.input.value = '';
      this.todoData.set(newTodo.key, newTodo);
      this.render();
    } else {
      alert('Поле должно быть заполнено');
    }
  }
  init() {
    this.form.addEventListener('submit', this.addTodo.bind(this));
    this.render();
  }

  generateKey() {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }

  createItem(todo) {
    const li = document.createElement('li');
    li.classList.add('todo-item');
    li.key = todo.key;

    li.insertAdjacentHTML(
      'beforeend',
      `
    <span class="text-todo">${todo.value}</span>
       <div class="todo-buttons">
       <button class="todo-edit"></button>
       <button class="todo-remove"></button>
       <button class="todo-complete"></button>
       </div>
    `
    );
    if (todo.completed) {
      this.todoCompleted.append(li);
    } else {
      this.todoList.append(li);
    }
  }

  deleteItem(elem) {
    this.todoData.delete(elem.key);
    this.render();
  }

  completedItem(elem) {
    let timer = 1,
      progress = 0,
      todo;

    const reverseAnimate = () => {
      if (progress > 0) {
        progress -= 3;
        elem.style.transform = `rotateY(${progress}deg)`;
        window.requestAnimationFrame(reverseAnimate);
      }
    };
    const animate = () => {
      if (progress < 90) {
        timer++;

        progress = timer * 2;
        elem.style.transform = `rotateY(${progress}deg)`;
        window.requestAnimationFrame(animate);
      } else {
        elem.remove();
        todo ? this.todoCompleted.append(elem) : this.todoList.append(elem);
        reverseAnimate();
      }
    };

    this.todoData.forEach((item) => {
      if (item.key === elem.key) {
        item.completed = !item.completed;
        this.addToStorage();
        if (item.completed) {
          todo = true;
          animate.call(this);
        } else {
          todo = false;
          animate();
        }
      }
    });
  }

  editTodo(elem) {
    elem.setAttribute('contenteditable', 'true');
    elem.classList.add('active');
    elem.focus();
    elem.addEventListener('blur', () => {
      elem.setAttribute('contenteditable', 'false');
      elem.classList.remove('active');
      this.todoData.forEach((item) => {
        if (item.key === elem.key) {
          item.value = elem.querySelector('span').textContent;
        }
      });
      this.render();
    });
  }

  render() {
    this.todoList.textContent = '';
    this.todoCompleted.textContent = '';
    this.todoData.forEach(this.createItem.bind(this));
    this.addToStorage();
    this.handler();
  }

  handler() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.todo-remove')) {
        const elem = e.target.closest('li');
        this.deleteItem(elem);
      }
      if (e.target.closest('.todo-complete')) {
        const elem = e.target.closest('li');
        this.completedItem(elem, e);
      }
      if (e.target.closest('.todo-edit')) {
        const elem = e.target.closest('li');
        this.editTodo(elem);
      }
    });
  }
}

const toDo = new ToDo('.todo-control', '.header-input', '.todo-list', '.todo-completed');
toDo.init();
