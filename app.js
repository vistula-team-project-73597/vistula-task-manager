"use strict";

const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const submitButton = document.getElementById("task-submit");
const cancelButton = document.getElementById("cancel-edit");
const formHeading = document.getElementById("form-heading");
const taskList = document.getElementById("task-list");
const statusMessage = document.getElementById("status-message");
let config;
let editingId = null;
let busy = false;

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function setBusy(value) {
  busy = value;
  document.querySelectorAll("button, input, textarea").forEach(element => {
    element.disabled = value;
  });
  taskList.setAttribute("aria-busy", String(value));
}

async function request(path, method = "GET", body) {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${config.tableName}${path}`, {
    method,
    headers: {
      apikey: config.supabasePublishableKey,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store"
  });
  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(details.message || `Request failed (${response.status}).`);
  }
  return response.status === 204 ? [] : response.json();
}

function resetForm() {
  editingId = null;
  form.reset();
  formHeading.textContent = "Add a task";
  submitButton.textContent = "Add task";
  cancelButton.hidden = true;
}

function renderTasks(tasks) {
  taskList.replaceChildren();
  if (!tasks.length) {
    const empty = document.createElement("p");
    empty.textContent = "No tasks yet. Add your first task above.";
    taskList.append(empty);
    return;
  }
  for (const task of tasks) {
    const item = document.createElement("article");
    item.className = `task-item${task.completed ? " completed" : ""}`;
    item.dataset.id = String(task.id);
    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title;
    const description = document.createElement("p");
    description.className = "task-description";
    description.textContent = task.description || "";
    const status = document.createElement("span");
    status.className = "task-status";
    status.textContent = task.completed ? "Completed" : "Incomplete";
    const actions = document.createElement("div");
    actions.className = "actions";
    for (const [className, label, handler] of [
      ["edit-task", "Edit", () => editTask(task.id)],
      ["toggle-task", task.completed ? "Mark incomplete" : "Mark completed", () => toggleTask(task.id)],
      ["delete-task", "Delete", () => deleteTask(task.id)]
    ]) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = className;
      button.textContent = label;
      button.disabled = busy;
      button.addEventListener("click", handler);
      actions.append(button);
    }
    item.append(title, description, status, actions);
    taskList.append(item);
  }
}

async function loadTasks() {
  const tasks = [];
  let page;
  do {
    page = await request(`?select=*&order=id.asc&limit=1000&offset=${tasks.length}`);
    tasks.push(...page);
  } while (page.length === 1000);
  renderTasks(tasks);
}

async function getTask(id) {
  const tasks = await request(`?id=eq.${encodeURIComponent(id)}&select=*`);
  if (!tasks.length) throw new Error("This task no longer exists. Refresh the page to update the list.");
  return tasks[0];
}

async function perform(action, successMessage) {
  if (busy) return;
  setBusy(true);
  showStatus("Working…");
  try {
    await action();
    showStatus(successMessage);
  } catch (error) {
    showStatus(`Could not finish the operation. ${error.message}`, true);
  } finally {
    setBusy(false);
  }
}

async function refreshAfterChange() {
  try {
    await loadTasks();
  } catch (error) {
    throw new Error(`The change was saved, but the task list could not be refreshed. Refresh the page. ${error.message}`);
  }
}

async function editTask(id) {
  await perform(async () => {
    const task = await getTask(id);
    editingId = task.id;
    titleInput.value = task.title;
    descriptionInput.value = task.description || "";
    formHeading.textContent = "Edit task";
    submitButton.textContent = "Save changes";
    cancelButton.hidden = false;
  }, "Edit the task and select Save changes.");
  if (editingId === id) titleInput.focus();
}

async function toggleTask(id) {
  await perform(async () => {
    const task = await getTask(id);
    const updated = await request(`?id=eq.${encodeURIComponent(id)}`, "PATCH", { completed: !task.completed });
    if (!updated.length) throw new Error("This task no longer exists. Refresh the page.");
    await refreshAfterChange();
  }, "Task status updated.");
}

async function deleteTask(id) {
  await perform(async () => {
    const deleted = await request(`?id=eq.${encodeURIComponent(id)}`, "DELETE");
    if (!deleted.length) throw new Error("This task no longer exists. Refresh the page.");
    if (editingId === id) resetForm();
    await refreshAfterChange();
  }, "Task deleted.");
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    showStatus("Enter a task title.", true);
    titleInput.focus();
    return;
  }
  const isEditing = editingId !== null;
  await perform(async () => {
    const task = { title, description: descriptionInput.value.trim() };
    const result = isEditing
      ? await request(`?id=eq.${encodeURIComponent(editingId)}`, "PATCH", task)
      : await request("", "POST", { ...task, completed: false });
    if (!result.length) throw new Error("The task was not saved. Refresh the page and try again.");
    resetForm();
    await refreshAfterChange();
  }, isEditing ? "Task updated." : "Task added.");
});

cancelButton.addEventListener("click", () => {
  resetForm();
  showStatus("Editing cancelled.");
  titleInput.focus();
});

async function initialize() {
  setBusy(true);
  try {
    const response = await fetch("config.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load config.json (${response.status}).`);
    config = await response.json();
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config.supabaseUrl)
      || !config.supabasePublishableKey?.startsWith("sb_publishable_")
      || config.tableName !== "tasks") {
      throw new Error("Invalid Supabase configuration in config.json.");
    }
    config.supabaseUrl = config.supabaseUrl.replace(/\/$/, "");
    await loadTasks();
    setBusy(false);
    showStatus("Tasks loaded.");
  } catch (error) {
    taskList.setAttribute("aria-busy", "false");
    showStatus(`Could not load tasks. ${error.message} Check your connection and refresh the page.`, true);
  }
}

initialize();
