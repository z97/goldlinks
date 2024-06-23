document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');

    loginButton.addEventListener('click', () => {
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        fetch('/adminLogin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/';
            } else {
                alert('Invalid credentials');
            }
        });
    });
});
