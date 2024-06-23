document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task');
    const addTaskButton = document.getElementById('add-task');

    let isAdmin = false;

    // Fetch and display tasks
    function loadTasks() {
        fetch('/tasks')
            .then(response => response.json())
            .then(tasks => {
                tasks.forEach(task => {
                    addTaskToList(task);
                });
            });
    }

    // Check if user is an admin
    function checkAdminStatus() {
        fetch('/isAdmin')
            .then(response => response.json())
            .then(data => {
                isAdmin = data.isAdmin;
            });
    }

    // Add a new task
    addTaskButton.addEventListener('click', () => {
        if (taskList.childElementCount >= 10) {
            alert('Cannot add more than 10 links.');
            return;
        }

        const task = newTaskInput.value.trim();

        // Validate task
        if (!task.startsWith("https://www.instagram.com/") || task.split(' ').length > 1 || task.includes('?')) {
            alert('Task must consist of one word, begin with "https://www.instagram.com/", and not contain "?".');
            return;
        }

        if (task) {
            addTaskToList(task);
            newTaskInput.value = '';
            saveTask(task);
        }
    });

    // Add task to the list
    function addTaskToList(task) {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = task;
        // Remove the trailing slash if present
        let linkText = task.replace("https://www.instagram.com/", "");
        if (linkText.endsWith('/')) {
            linkText = linkText.slice(0, -1);
        }
        link.textContent = linkText;
        link.target = "_blank";
        li.appendChild(link);
        taskList.appendChild(li);

        // Add delete option if admin
        if (isAdmin) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.style.marginLeft = '10px';
            deleteButton.addEventListener('click', () => {
                if (confirm(`Delete task: ${task}?`)) {
                    fetch('/deleteTask', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ task }),
                    }).then(response => {
                        if (response.status === 200) {
                            li.remove();
                        } else {
                            alert('Unauthorized');
                        }
                    });
                }
            });
            li.appendChild(deleteButton);
        }
    }

    // Save task to the server
    function saveTask(task) {
        fetch('/addTask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task }),
        });
    }

    // Load tasks and check admin status when the page is loaded
    loadTasks();
    checkAdminStatus();
});

