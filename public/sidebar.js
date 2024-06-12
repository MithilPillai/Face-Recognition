// sidebar.js
function toggleMenu() {
    var menu = document.getElementById('menuItems');
    menu.classList.toggle('active');
}


function getUserEmail() {
    var userEmailDiv = document.getElementById("userEmailDiv");
    var userEmail = localStorage.getItem('userEmail');
    userEmailDiv.innerHTML = `${userEmail}`;
}
document.addEventListener("DOMContentLoaded", getUserEmail);



function toggleSettingsMenu() {
    var settingsMenuItems = document.getElementById("settingsMenuItems");
    if (settingsMenuItems.style.display === "block") {
        settingsMenuItems.style.display = "none";
        settingsMenuItems.classList.remove("active");
    } else {
        settingsMenuItems.style.display = "block";
        settingsMenuItems.classList.add("active");
    }
}

var modal = document.getElementById("myModal");
var deleteAccountBtn = document.getElementById("deleteAccountBtn");
var closeBtn = document.getElementsByClassName("close")[0];
var confirmDelete = document.getElementById("confirmDelete");
var cancelDelete = document.getElementById("cancelDelete");

deleteAccountBtn.addEventListener("click", function () {
    modal.style.display = "block";
});

closeBtn.onclick = function () {
    modal.style.display = "none";
}

confirmDelete.onclick = function () {
    const userId = localStorage.getItem("userId");
    fetch('/delete-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Account deleted successfully.");
                localStorage.removeItem("userId");
                window.location.href = "index.html";
            } else {
                alert("Failed to delete account. Please try again.");
            }
        })
        .catch(error => {
            console.error('Error deleting account:', error);
            alert("Error deleting account. Please try again later.");
        });
    modal.style.display = "none";
};

cancelDelete.onclick = function () {
    modal.style.display = "none";
};

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// Add event listener for Logout Button
var logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("userId");
        window.location.href = "login.html";
    });
}
