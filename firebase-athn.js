    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

        const firebaseConfig = {
            apiKey: "AIzaSyCfxNU7BbmtvNlTBdEFa4JEq8MbnT5r41Q",
            authDomain: "what-to-do-2fcc7.firebaseapp.com",
            projectId: "what-to-do-2fcc7",
            storageBucket: "what-to-do-2fcc7.firebasestorage.app",
            messagingSenderId: "982422793450",
            appId: "1:982422793450:web:9339738576ddf5837ebb93"
        };

        const app = initializeApp(firebaseConfig);

        import {getDatabase, ref, child, get, set, update, remove, push} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
        const db = getDatabase();

        let taskName = document.getElementById('taskName');
        let taskDueDate = document.getElementById('taskDueDate');
        let taskDueTime = document.getElementById('taskDueTime');
        let taskPriority = document.getElementById('taskPriority');

        let addForm = document.getElementById('addForm');

        function addData(){
            const taskRef = push(ref(db, "tasks"));

            set(taskRef, {
                name: taskName.value,
                dueDate: taskDueDate.value,
                dueTime: taskDueTime.value,
                priority: taskPriority.value,
                isDone: false,
                addedOn: Date.now()
            })
            .then(()=>{
                alert("Data added successfully.");
            })
            .catch((error)=>{
                alert("Error.");
                console.log(error);
            })
        }

        addForm.addEventListener('click', addData);
    </script>