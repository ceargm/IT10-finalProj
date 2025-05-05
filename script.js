function showSection(id) {
    const activeSection = document.getElementById(id);
    const textDescription = document.querySelector('.textDescription');

    // Toggle the 'active' class on the clicked section
    if (activeSection.classList.contains('active')) {
        // Hide the section if it's already active
        activeSection.classList.remove('active');
        textDescription.style.display = 'block'; // Show the login text again
    } else {
        // Hide all sections first
        const sections = document.querySelectorAll('.card-section');
        sections.forEach(section => section.classList.remove('active'));

        // Show the clicked section
        activeSection.classList.add('active');

        // Hide the login text when a section is active
        textDescription.style.display = 'none';
    }
}



// Get current logged-in user from localStorage
let currentUser = JSON.parse(localStorage.getItem('bhmsUser')) || null;
if (!currentUser) {
    alert('Please log in first!');
    window.location.href = 'login.html'; // Redirect if no user is logged in
    throw new Error('User not logged in');
}

document.getElementById("usernameDisplay").textContent = currentUser.username;



