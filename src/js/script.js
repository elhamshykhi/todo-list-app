const input = document.querySelector("#add_todo_input");
const addTodoBtn = document.querySelector("#add_todo_btn");
const filters = document.querySelector("#filters");
const filterItems = [...document.querySelectorAll("#filters li")];
const todoList = document.querySelector("#todo_list");
const todosInfo = document.querySelector("#todos_info");
const clearAll = document.querySelector("#clear_all_btn");
const clearCompleted = document.querySelector("#clear_completed_btn");
const remainedTodos = document.querySelector("#remained_todos");

let editElement;
let editFlag = false;
let editId = "";

let filterValue = "all";

// FUNCTION ======================================
function createTodos(todos) {
  todoList.innerHTML = todos
    .map(
      (todo) => `<li id=${
        todo.id
      } class="capitalize flex items-center justify-between bg-white shadow-sm text-blue-900 px-4 py-2 sm:py-2.5 rounded-full ${
        todo.isCompleted ? "opacity-70" : ""
      }">
        <p class="sm:text-lg capitalize font-normal ${
          todo.isCompleted ? "line-through" : ""
        }">${todo.title}</p>

        <div class="flex items-center justify-end gap-x-1 sm:gap-x-1.5">
          <button data-id="${todo.id}" data-btn="check" type="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 pointer-events-none"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </button>
          <button data-id="${todo.id}" data-btn="edit" type="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4 pointer-events-none"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
              />
            </svg>
          </button>
          <button data-id="${todo.id}" data-btn="delete" type="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 pointer-events-none"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </li>
  `
    )
    .join("");

  const uncompletedTodos = todos.filter((todo) => !todo.isCompleted);
  remainedTodos.innerHTML = `${uncompletedTodos.length} ${
    uncompletedTodos.length <= 1 ? "item" : "items"
  } left`;
}

function addTodo(e) {
  e.preventDefault();
  let todos = getAllFromLocalStorage();

  const newTodo = {
    title: input.value,
    id: Date.now(),
    isCompleted: false,
  };

  if (input.value && !editFlag) {
    saveToLocalStorage(newTodo);
    todos.push(newTodo);
    filterTodos();

    if (todos.length) {
      showFilters();
    }
  } else if (input.value && editFlag) {
    todos.forEach((todo) => {
      if (todo.id === editId) {
        todo.title = input.value;
      }
    });

    editFlag = false;
    editId = "";
    addTodoBtn.innerHTML = "submit";

    saveAllToLocalStorage(todos);
    filterTodos();
  }
  input.value = "";
}

function changeTodo(e) {
  let todos = getAllFromLocalStorage();

  if (e.target.tagName === "BUTTON") {
    const target = e.target;
    const targetId = Number(e.target.dataset.id);
    const targetBtn = target.dataset.btn.toLowerCase().trim();

    if (targetBtn === "delete") {
      todos = todos.filter((todo) => todo.id !== targetId);
      saveAllToLocalStorage(todos);
      filterTodos();
      if (!todos.length) {
        hideFilters();
      }
    } else if (targetBtn === "edit") {
      const selectedTodo = todos.find((todo) => todo.id === targetId);
      input.value = selectedTodo.title;
      input.select();
      addTodoBtn.innerHTML = "edit";
      target.classList.add("selectedBtn");
      editFlag = true;
      editId = selectedTodo.id;
      editElement = selectedTodo;
    } else {
      const selectedTodo = todos.find((todo) => todo.id === targetId);
      selectedTodo.isCompleted = !selectedTodo.isCompleted;
      saveAllToLocalStorage(todos);
      filterTodos();
    }
  }
}

function clearAllTodos() {
  deleteAllFromLocalStorage();
  let todos = getAllFromLocalStorage();
  filterTodos();
  if (!todos.length) {
    hideFilters();
  }
}

function clearCompletedTodos() {
  let todos = getAllFromLocalStorage();
  todos = todos.filter((todo) => !todo.isCompleted);
  saveAllToLocalStorage(todos);
  filterTodos();
  if (!todos.length) {
    hideFilters();
  }
}

function filterTodos() {
  let todos = getAllFromLocalStorage();

  switch (filterValue) {
    case "all": {
      createTodos(todos);
      break;
    }
    case "completed": {
      createTodos(todos.filter((todo) => todo.isCompleted));
      break;
    }
    case "uncompleted": {
      createTodos(todos.filter((todo) => !todo.isCompleted));
      break;
    }

    default: {
      createTodos(todos);
      break;
    }
  }
}

function setUI() {
  let todos = getAllFromLocalStorage();
  filterTodos();

  if (todos.length) {
    showFilters();
  } else {
    hideFilters();
  }

  filterItems.forEach((item) => {
    if (item.dataset.id === filterValue) {
      item.classList.add("selectedFilterItem");
    } else {
      item.classList.remove("selectedFilterItem");
    }
  });
}

function selectFilterItem(e) {
  const targetId = e.target.dataset.id;
  if (targetId !== undefined) {
    filterValue = e.target.dataset.id;
  }

  filterItems.forEach((item) => {
    if (item.dataset.id === filterValue) {
      item.classList.add("selectedFilterItem");
    } else {
      item.classList.remove("selectedFilterItem");
    }
  });

  filterTodos();
}

function showFilters() {
  todosInfo.classList.add("showFilters");
  filters.classList.add("showFilters");
}

function hideFilters() {
  todosInfo.classList.remove("showFilters");
  filters.classList.remove("showFilters");
  todoList.innerHTML = `<p class="text-center text-xl text-white font-bold capitalize mt-6">add your first todo ...</p>`;
}

// LOCAL STORAGE ======================================
function getAllFromLocalStorage() {
  let allTodos = JSON.parse(localStorage.getItem("tasks")) || [];
  return allTodos;
}

function saveToLocalStorage(todo) {
  let todos = getAllFromLocalStorage();
  todos.push(todo);
  localStorage.setItem("tasks", JSON.stringify(todos));
}

function deleteAllFromLocalStorage() {
  localStorage.clear("tasks");
}

function saveAllToLocalStorage(todos) {
  localStorage.setItem("tasks", JSON.stringify(todos));
}

// EVENTS ======================================
addTodoBtn.addEventListener("click", addTodo);
document.addEventListener("DOMContentLoaded", setUI);
todoList.addEventListener("click", changeTodo);
clearAll.addEventListener("click", clearAllTodos);
clearCompleted.addEventListener("click", clearCompletedTodos);
filters.addEventListener("click", selectFilterItem);
