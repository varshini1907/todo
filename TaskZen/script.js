const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDate');
const createTaskBtn = document.getElementById('createTaskBtn');
const tasksContainer = document.getElementById('tasksContainer');
const deleteCompletedBtn = document.getElementById('deleteCompletedBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

let tasks = [];
let filter = 'all';


// ---------------- LOCAL STORAGE ----------------

function saveTasksToLocalStorage() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const storedTasks = localStorage.getItem('tasks');

  tasks = storedTasks ? JSON.parse(storedTasks) : [];
}


// ---------------- DATE FUNCTIONS ----------------

function formatDueDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function isOverdue(task) {
  return (
    task.dueDate &&
    !task.completed &&
    new Date(task.dueDate).getTime() < Date.now()
  );
}


// ---------------- ADD TASK ----------------

createTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});

function addTask() {

  const taskText = taskInput.value.trim();
  const dueDate = dueDateInput.value;

  if (!taskText) {
    alert('Please enter a task!');
    return;
  }

  if (dueDate && new Date(dueDate).getTime() < Date.now()) {
    alert('Due date cannot be in the past!');
    return;
  }

  const task = {
    text: taskText,
    dueDate: dueDate || null,
    completed: false,
    id: Date.now(),
  };

  tasks.push(task);

  saveTasksToLocalStorage();

  renderTasks();

  taskInput.value = '';
  dueDateInput.value = '';
}


// ---------------- RENDER TASKS ----------------

function renderTasks() {

  tasksContainer.innerHTML = '';

  let filteredTasks = tasks;

  if (filter === 'active') {

    filteredTasks = tasks.filter(
      t => !t.completed && !isOverdue(t)
    );

  } else if (filter === 'completed') {

    filteredTasks = tasks.filter(
      t => t.completed
    );

  } else if (filter === 'overdue') {

    filteredTasks = tasks.filter(
      t => isOverdue(t)
    );
  }

  filteredTasks.forEach(task => {
    tasksContainer.appendChild(createTaskElement(task));
  });
}


// ---------------- CREATE TASK ELEMENT ----------------

function createTaskElement(task) {

  const taskItemDiv = document.createElement('div');

  taskItemDiv.classList.add('task-item-dynamic');

  taskItemDiv.setAttribute('data-id', task.id);

  if (isOverdue(task)) {
    taskItemDiv.classList.add('expired-task');
  }


  // Checkbox

  const completeCheckbox = document.createElement('input');

  completeCheckbox.type = 'checkbox';

  completeCheckbox.className = 'task-complete-checkbox';

  completeCheckbox.checked = task.completed;


  // Task Text

  const taskTextSpan = document.createElement('span');

  taskTextSpan.className = 'task-text-content';

  taskTextSpan.textContent = task.text;

  if (task.completed) {
    taskTextSpan.classList.add('completed');
  }


  // Due Date

  const dueDateInfoSpan = document.createElement('span');

  dueDateInfoSpan.className = 'due-date-info';


  let countdownInterval = null;

  function updateCountdown() {

    if (!task.dueDate) {
      dueDateInfoSpan.textContent = '';
      return;
    }

    const dueDateTime = new Date(task.dueDate).getTime();

    const now = Date.now();

    const distance = dueDateTime - now;

    if (task.completed) {

      dueDateInfoSpan.textContent = ' (Completed)';

      clearInterval(countdownInterval);

    } else if (distance < 0) {

      dueDateInfoSpan.textContent = ' (Expired)';

      clearInterval(countdownInterval);

      taskItemDiv.classList.add('expired-task');

    } else {

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) /
        (1000 * 60 * 60)
      );

      const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) /
        (1000 * 60)
      );

      const seconds = Math.floor(
        (distance % (1000 * 60)) /
        1000
      );

      dueDateInfoSpan.textContent =
        ` (Due: ${formatDueDate(task.dueDate)} - ${days}d ${hours}h ${minutes}m ${seconds}s)`;
    }
  }

  if (task.dueDate) {

    updateCountdown();

    countdownInterval = setInterval(updateCountdown, 1000);
  }


  // Edit Button

  const editBtn = document.createElement('button');

  editBtn.className = 'task-edit-btn';

  editBtn.textContent = 'Edit';


  // Delete Button

  const deleteBtn = document.createElement('button');

  deleteBtn.className = 'task-delete-btn';

  deleteBtn.textContent = 'Delete';


  // ---------------- EDIT LOGIC ----------------

  editBtn.addEventListener('click', () => {

    const editInput = document.createElement('input');

    editInput.type = 'text';

    editInput.value = task.text;

    editInput.className = 'task-edit-input';


    const editDueInput = document.createElement('input');

    editDueInput.type = 'datetime-local';

    editDueInput.value = task.dueDate || '';

    editDueInput.className = 'task-edit-due-input';


    const saveBtn = document.createElement('button');

    saveBtn.className = 'task-save-btn';

    saveBtn.textContent = 'Save';


    const cancelBtn = document.createElement('button');

    cancelBtn.className = 'task-cancel-btn';

    cancelBtn.textContent = 'Cancel';


    taskItemDiv.innerHTML = '';

    taskItemDiv.appendChild(completeCheckbox);

    taskItemDiv.appendChild(editInput);

    taskItemDiv.appendChild(editDueInput);

    taskItemDiv.appendChild(saveBtn);

    taskItemDiv.appendChild(cancelBtn);


    saveBtn.addEventListener('click', () => {

      const newText = editInput.value.trim();

      const newDue = editDueInput.value;

      if (!newText) {
        alert('Task cannot be empty!');
        return;
      }

      if (newDue && new Date(newDue).getTime() < Date.now()) {
        alert('Due date cannot be in the past!');
        return;
      }

      task.text = newText;

      task.dueDate = newDue || null;

      saveTasksToLocalStorage();

      renderTasks();
    });


    cancelBtn.addEventListener('click', renderTasks);
  });


  // ---------------- DELETE LOGIC ----------------

  deleteBtn.addEventListener('click', () => {

    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    tasks = tasks.filter(
      t => t.id !== task.id
    );

    saveTasksToLocalStorage();

    renderTasks();
  });


  // ---------------- COMPLETE TASK ----------------

  completeCheckbox.addEventListener('change', () => {

    task.completed = completeCheckbox.checked;

    saveTasksToLocalStorage();

    renderTasks();
  });


  // ---------------- APPEND ----------------

  taskItemDiv.appendChild(completeCheckbox);

  taskItemDiv.appendChild(taskTextSpan);

  if (task.dueDate) {
    taskItemDiv.appendChild(dueDateInfoSpan);
  }

  taskItemDiv.appendChild(editBtn);

  taskItemDiv.appendChild(deleteBtn);

  return taskItemDiv;
}


// ---------------- DELETE COMPLETED ----------------

deleteCompletedBtn.addEventListener('click', () => {

  const completedCount = tasks.filter(
    t => t.completed
  ).length;

  if (completedCount === 0) {

    alert('No completed tasks to delete!');

    return;
  }

  if (
    confirm(
      `Are you sure you want to delete all ${completedCount} completed tasks?`
    )
  ) {

    tasks = tasks.filter(
      t => !t.completed
    );

    saveTasksToLocalStorage();

    renderTasks();
  }
});


// ---------------- FILTERS ----------------

filterBtns.forEach(btn => {

  btn.addEventListener('click', () => {

    filterBtns.forEach(
      b => b.classList.remove('active')
    );

    btn.classList.add('active');

    filter = btn.getAttribute('data-filter');

    renderTasks();
  });
});


// ---------------- INITIAL LOAD ----------------

filterBtns[0].classList.add('active');

loadTasksFromLocalStorage();

renderTasks();