document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="text"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    
    const user = {
        email: email,
        pass: password
    };

    fetch('/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user: user })

    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Login Successful:', data);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
});

document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = e.target.querySelector('input[type="text"]').value;
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    console.log(name);
    
    const user = {
        name: name,
        email: email,
        pass: password
    };

    fetch('/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user: user })
    })
    .then(response => {
        if (response.status === 409) {
            alert('User already exists! Please choose a different email.');
            throw new Error('User already exists');
        }
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Signup Successful:', data);
        alert('You are successfully registered! You can login now');
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
});
