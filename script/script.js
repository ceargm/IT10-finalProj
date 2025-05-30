function showSection(id) {
    const activeSection = document.getElementById(id);
    const textDescription = document.querySelector('.textDescription');
    // const title = document.querySelector('.title');

    // Toggle the 'active' class on the clicked section
    if (activeSection.classList.contains('active')) {
        // Hide the section if it's already active
        activeSection.classList.remove('active');
        textDescription.style.display = 'block'; // Show the login text again
        // title.style.display = 'block'; // Show the login text again
    } else {
        // Hide all sections first
        const sections = document.querySelectorAll('.card-section');
        sections.forEach(section => section.classList.remove('active'));

        // Show the clicked section
        activeSection.classList.add('active');

        // Hide the login text when a section is active
        textDescription.style.display = 'none';
        // title.style.display = 'none';
    }
}

// Get current logged-in user from localStorage
let currentUser = JSON.parse(localStorage.getItem('bhmsUser')) || null;
if (!currentUser) {
    alert('Please log in first!');
    window.location.href = 'index.html'; // Redirect if no user is logged in
    throw new Error('User not logged in');
}

document.getElementById("usernameDisplay").textContent = currentUser.username;


function logout() {
    //check if the user really wants to logout
    showModal("confirm","Logout", "Are you sure you want to logout?", (confirmed) => {
    if (!confirmed) return;
        // Clear user data from local storage or session storage
        localStorage.removeItem("bhmsUser"); // if you're using localStorage
        // Redirect to login page
        window.location.href = 'index.html';
    });
}

function toggleTips(id) {
    const content = document.getElementById(id);
    content.style.display = content.style.display === "none" || content.style.display === "" ? "block" : "none";
}


// Validate Date Format (YYYY/MM/DD) and ensure the date is not greater than today's date
function isValidDateFormat(dateStr) {
    const regex = /^\d{4}\/\d{2}\/\d{2}$/;
    if (!regex.test(dateStr)) return false;

    const [year, month, day] = dateStr.split("/").map(Number);
    const date = new Date(year, month - 1, day); // JS months are 0-based
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set current date to midnight for comparison

    // Ensure that the date is not greater than today's date
    if (date > currentDate) return false;

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

// Validate Phone Number (starts with 09 and followed by 9 digits)
function isValidPhoneNumber(number) {
    const regex = /^09\d{9}$/; // starts with 09 and followed by 9 digits (total 11)
    return regex.test(number);
}

// custome modal

function showModal(type, title, message, callback) {
    const modal = document.getElementById("customModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalMessage = document.getElementById("modalMessage");
    const modalButtons = document.getElementById("modalButtons");
  
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalButtons.innerHTML = ''; // Clear previous buttons
  
    if (type === "alert") {
      const okBtn = document.createElement("button");
      okBtn.className = "btn-ok";
      okBtn.textContent = "OK";
      okBtn.onclick = () => {
        closeModal();
        if (callback) callback();
      };
      modalButtons.appendChild(okBtn);
    } else if (type === "confirm") {
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "btn-cancel";
      cancelBtn.textContent = "Cancel";
      cancelBtn.onclick = () => {
        closeModal();
        if (callback) callback(false);
      };
  
      const okBtn = document.createElement("button");
      okBtn.className = "btn-ok";
      okBtn.textContent = "OK";
      okBtn.onclick = () => {
        closeModal();
        if (callback) callback(true);
      };
  
      modalButtons.appendChild(cancelBtn);
      modalButtons.appendChild(okBtn);
    }
  
    modal.style.display = "flex";
  }
  
  function closeModal() {
    document.getElementById("customModal").style.display = "none";
  }
  
