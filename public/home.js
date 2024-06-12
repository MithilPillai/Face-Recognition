
// Function to execute when the DOM is fully loaded


window.onload = function () {
    // Check if userId exists in localStorage
    if (!localStorage.getItem("userId")) {
        window.location.href = "login.html";
    } else {
        console.log("User ID:", localStorage.getItem("userId"));
        // document.getElementById("photosUrl").src = "/images/" + localStorage.getItem("userId");
        // Fetch user's name and display welcome message
        fetch('/get-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: localStorage.getItem("userId") })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // addEvents(data.events);
                    document.getElementById("welcomeMessage").innerText = "Welcome, " + data.name + "!";
                    localStorage.setItem("userEmail", data.email);
                    // document.getElementById("photosUrl").href = "/images/" + data.userName;
                    // document.getElementById("copyLinkBtn").setAttribute("data-link", "/images/" + data.userName);

                } else {
                    console.error("Failed to fetch user's name.");
                }
            })
            .catch(error => {
                console.error('Error fetching user:', error);
            });
    }

};