window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("eventId");
    const username = urlParams.get("username");

    console.log("eventId:", eventId);
    console.log("username:", username);

    if (!eventId || !username) {
        console.error("Missing eventId or username in the URL.");
        return;
    }

    fetchUserImages(eventId, username);
};

function fetchUserImages(eventId, username) {
    fetch(`/user-images/${eventId}/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                populateUserImages(data.userImages);
            } else {
                console.error("Failed to fetch user images.");
            }
        })
        .catch(error => {
            console.error("Error fetching user images:", error);
        });
}

function populateUserImages(images) {
    const photoGallery = document.getElementById("photoGallery");

    if (images.length > 0) {
        photoGallery.innerHTML = "";
        images.forEach(image => {
            const photoContainer = document.createElement("div");
            photoContainer.classList.add("photo-container");
            const img = document.createElement("img");
            img.classList.add("photo");
            img.src = image;
            img.alt = "User Photo";
            photoContainer.appendChild(img);
            photoGallery.appendChild(photoContainer);
        });
    } else {
        photoGallery.innerHTML = "<p>No photos available.</p>";
    }
}


function copylink() {
    let url = new URL(window.location.href);
    let searchParams = new URLSearchParams(url.search);

    const link = `http://localhost:3000/userImages.html?eventId=${encodeURIComponent(searchParams.get('eventId'))}&username=${encodeURIComponent(searchParams.get('username'))}`;

    navigator.clipboard.writeText(link)
        .then(() => {
            console.log("Link copied to clipboard");
            alert("Link to your images has been copied!");
        })
        .catch(err => {
            console.error("Failed to copy link:", err);
        });
}
