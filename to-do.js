import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, push, set, update, remove, onChildAdded } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

const firebaseConfig = { // firebase configuration
    apiKey: "AIzaSyCfxNU7BbmtvNlTBdEFa4JEq8MbnT5r41Q",
    authDomain: "what-to-do-2fcc7.firebaseapp.com",
    databaseURL: "https://what-to-do-2fcc7-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "what-to-do-2fcc7",
    storageBucket: "what-to-do-2fcc7.appspot.com",
    messagingSenderId: "982422793450",
    appId: "1:982422793450:web:9339738576ddf5837ebb93"
};

const app = initializeApp(firebaseConfig); // initializes firebase and grabs the db
const db = getDatabase();

const taskName = document.getElementById('taskName'); // grabs the input fields and local task container
const taskDueDate = document.getElementById('taskDueDate');
const taskDueTime = document.getElementById('taskDueTime');
const taskPriority = document.getElementById('taskPriority');
const indvTasks = document.getElementById('indv-tasks');
let tasksArray = [];

function addData() { // function to add data to the db
    const taskRef = push(ref(db, "tasks"));
    set(taskRef, {
        name: taskName.value,
        dueDate: taskDueDate.value,
        dueTime: taskDueTime.value,
        priority: taskPriority.value,
        isDone: false,
        addedOn: Date.now()
    }).then(() => {
        alert("Data added successfully.");
        document.getElementById('task-form').reset();
    }).catch((error) => {
        alert("Error.");
        console.log(error);
    });
}

const tasksRef = ref(db, 'tasks'); // listens for new tasks that are added to the db then puts it on the local array
onChildAdded(tasksRef, (snapshot) => {
    const task = snapshot.val();
    const taskID = snapshot.key;
    tasksArray.push({ ...task, id: taskID });
    renderTasks(tasksArray);
});

function renderTasks(tasks) { // function to render tasks to the DOM
    indvTasks.innerHTML = '';
    tasks.forEach(task => {
        const taskID = task.id;
        const taskDiv = document.createElement('div');
        taskDiv.classList.add("card", "p-2", "mb-2"); // creates a task card when added task is rendered
        taskDiv.innerHTML = ` 
            <div class="task-card priority-${task.priority}">
                <div class="task-info d-flex align-items-center">
                    <input type="checkbox" class="markasDone me-2" data-id="${taskID}" ${task.isDone ? 'checked' : ''}>
                    <div>
                        <h5${task.isDone ? ' class="completed"' : ''}>${task.name}</h5>
                        <p${task.isDone ? ' class="completed"' : ''}>Due: ${task.dueDate} ${task.dueTime}</p>
                    </div>
                </div>
                <div class="task-actions mt-2">
                    <button class="edit-btn btn btn-sm btn-outline-primary me-2" data-id="${taskID}">Edit</button>
                    <button class="delete-btn btn btn-sm btn-outline-danger">Delete</button>
                </div>
            </div>
        `;

        taskDiv.querySelector(".markasDone").addEventListener('change', (e) => { // updates isDone status and toggles complete
            const isChecked = e.target.checked;
            update(ref(db, "tasks/" + taskID), { isDone: isChecked });
            const h5 = taskDiv.querySelector("h5");
            const p = taskDiv.querySelector("p");
            h5.classList.toggle('completed', isChecked);
            p.classList.toggle('completed', isChecked);
        });

        taskDiv.querySelector(".delete-btn").addEventListener('click', () => { // function when delete button is clicked
            if (confirm("Are you sure you want to delete this task?")) {
                const deletedTask = { ...task, id: taskID };
                remove(ref(db, "tasks/" + taskID)).then(() => {
                    taskDiv.remove();
                    const undoToast = document.createElement('div');
                    undoToast.className = "undoToast";
                    undoToast.innerHTML = `
                        <div id="undoText"><p>Task Deleted</p></div>
                        <div id="undoFunction"><button id="undo-btn">Undo</button></div>
                        <div id="undoClose"><button id="close-btn" onclick="this.parentElement.parentElement.remove();">&times;</button></div>
                    `;
                    document.body.appendChild(undoToast); // function to undo delete
                    undoToast.querySelector('#undo-btn').addEventListener('click', () => {
                        set(ref(db, "tasks/" + taskID), deletedTask).then(() => {
                            undoToast.remove();
                            window.location.reload();
                        });
                    });
                    setTimeout(() => {
                        if (undoToast.parentNode) undoToast.remove();
                    }, 5000);
                });
            }
        });

        taskDiv.querySelector(".edit-btn").addEventListener('click', () => { // function when edit button is clicked
            const infoDiv = taskDiv.querySelector('.task-info');
            const actionsDiv = taskDiv.querySelector('.task-actions');
            infoDiv.innerHTML = `
                <input type="text" value="${task.name}">
                <input type="date" value="${task.dueDate}">
                <input type="time" value="${task.dueTime}">
                <select>
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                </select>
            `;
            actionsDiv.innerHTML = `
                <button class="save-btn btn btn-sm btn-success me-2">Save</button>
                <button class="cancel-btn btn btn-sm btn-secondary">Cancel</button>
            `;
            actionsDiv.querySelector(".save-btn").addEventListener('click', () => {
                const updatedTask = {
                    name: infoDiv.querySelector('input[type="text"]').value,
                    dueDate: infoDiv.querySelector('input[type="date"]').value,
                    dueTime: infoDiv.querySelector('input[type="time"]').value,
                    priority: infoDiv.querySelector('select').value
                };
                update(ref(db, "tasks/" + taskID), updatedTask);
                window.location.reload();
            });
            actionsDiv.querySelector(".cancel-btn").addEventListener('click', () => {
                window.location.reload();
            });
        });

        indvTasks.appendChild(taskDiv); // appends task card to the container
    });
}

document.getElementById('task-form').addEventListener('submit', function (e) { // event listener for adding task
    e.preventDefault();
    addData();
});

// the following are event listeners for the sorting buttons

document.getElementById('sortDateAdded').addEventListener('click', () => { 
    tasksArray.sort((a, b) => a.addedOn - b.addedOn);
    renderTasks(tasksArray);
});

document.getElementById('sortDueDate').addEventListener('click', () => {
    tasksArray.sort((a, b) => new Date(a.dueDate + " " + a.dueTime) - new Date(b.dueDate + " " + b.dueTime));
    renderTasks(tasksArray);
});

document.getElementById('sortPriority').addEventListener('click', () => {
    const priorityMap = { low: 3, medium: 2, high: 1 };
    tasksArray.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);
    renderTasks(tasksArray);
});
