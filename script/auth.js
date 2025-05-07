// Signup
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;

    // Get existing users or create an empty array if no users exist
    let users = JSON.parse(localStorage.getItem('bhmsUsers')) || [];

    // Check if the username already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
      alert('Username already taken! Please choose another one.');
      return;
    }

    // Add the new user to the users array
    users.push({ username, password });

    // Save updated users array to localStorage
    localStorage.setItem('bhmsUsers', JSON.stringify(users));

    alert('Signup Successful! Please login.');
    window.location.href = 'login.html';  // Redirect to the login page after signup
  });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Get the list of saved users from localStorage
    const users = JSON.parse(localStorage.getItem('bhmsUsers')) || [];

    // Check if the entered username and password match any saved user
    const loggedInUser = users.find(user => user.username === username && user.password === password);

    if (loggedInUser) {
      // Store the logged-in user in localStorage for later use
      localStorage.setItem('bhmsUser', JSON.stringify(loggedInUser));

      alert('Login Successful!');
      window.location.href = 'dashboard.html';  // Redirect to the dashboard page after successful login
    } else {
      alert('Invalid credentials. Try again.');
    }
  });
}
