// window.onload = function () {
//     const urlParams = new URLSearchParams(window.location.search);
//     const eventId = urlParams.get("eventId");
//     const username = urlParams.get("username");

//     console.log("eventId:", eventId);
//     console.log("username:", username);

//     if (!eventId || !username) {
//         console.error("Missing eventId or username in the URL.");
//         return;
//     }

//     fetchUserImages(eventId, username);
// };
// 
// window.onload = function () {
//     const urlParams = new URLSearchParams(window.location.search);
//     const eventId = urlParams.get("eventId");
//     const username = urlParams.get("username");

//     if (!eventId || !username) {
//         console.error("Missing eventId or username in the URL.");
//         return;
//     }

//     // Existing code to fetch and display photos
//     fetchUserImages(eventId, username);

//     // Set data attributes for the copy link button
//     const copyButton = document.getElementById("copySortedLinkBtn");
//     copyButton.setAttribute("data-event-id", eventId);
//     copyButton.setAttribute("data-event-name", username); // Assuming username is the event name for this context
// };


// function fetchUserImages(eventId, username) {
//     fetch(`/user-images/${eventId}/${username}`)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             if (data.success) {
//                 populateUserImages(data.userImages);
//             } else {
//                 console.error("Failed to fetch user images.");
//             }
//         })
//         .catch(error => {
//             console.error("Error fetching user images:", error);
//         });
// }
window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("eventId");
    const username = urlParams.get("username");

    if (!eventId || !username) {
        console.error("Missing eventId or username in the URL.");
        return;
    }

    fetchUserImages(eventId, username);

    const copyButton = document.getElementById("copySortedLinkBtn");
    if (copyButton) {
        copyButton.setAttribute("data-event-id", eventId);
        copyButton.setAttribute("data-event-name", username);
    }
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


// function copylink() {
//     let url = new URL(window.location.href);
//     let searchParams = new URLSearchParams(url.search);

//     const link = `http://localhost:3000/userImages.html?eventId=${encodeURIComponent(searchParams.get('eventId'))}&username=${encodeURIComponent(searchParams.get('username'))}`;

//     navigator.clipboard.writeText(link)
//         .then(() => {
//             console.log("Link copied to clipboard");
//             alert("Link to your images has been copied!");
//         })
//         .catch(err => {
//             console.error("Failed to copy link:", err);
//         });
// }

// function copylink(button) {
//     const eventId = button.getAttribute("data-event-id");
//     const eventName = button.getAttribute("data-event-name");

//     if (!eventId || !eventName) {
//         console.error("Missing event ID or name");
//         return;
//     }

//     // const link = `/userImages.html?id=${eventId}&name=${encodeURIComponent(eventName)}`;
//         const link = `/userImages.html?eventId=${eventId}&username=${encodeURIComponent(eventName)}`;


//     navigator.clipboard.writeText("http://localhost:3000" + link)
//         .then(() => {
//             console.log("Link copied to clipboard");
//             button.innerHTML = "Copied!";
//             setTimeout(() => {
//                 button.innerHTML = "Copy Link";
//             }, 2000);
//         })
//         .catch((err) => {
//             console.error("Failed to copy link:", err);
//         });
// }
function copylink(button) {
    const eventId = button.getAttribute("data-event-id");
    const eventName = button.getAttribute("data-event-name");

    if (!eventId || !eventName) {
        console.error("Missing event ID or name");
        return;
    }

    const link = `/userImages.html?eventId=${eventId}&username=${encodeURIComponent(eventName)}`;

    navigator.clipboard.writeText("http://localhost:3000" + link)
        .then(() => {
            console.log("Link copied to clipboard");
            button.innerHTML = "Copied!";
            setTimeout(() => {
                button.innerHTML = "Copy Link";
            }, 2000);
        })
        .catch((err) => {
            console.error("Failed to copy link:", err);
        });
}



function openModal(src) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const downloadBtn = document.getElementById("downloadBtn");
    modal.style.display = "flex";
    modalImg.src = src;
    downloadBtn.href = src;
}

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("imageModal");
    const span = document.getElementsByClassName("close")[0];

    if (span) {
        span.onclick = function () {
            modal.style.display = "none";
        };
    }

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
});

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
            img.addEventListener('click', function() {
                openModal(img.src);
            });

            photoContainer.appendChild(img);
            photoGallery.appendChild(photoContainer);
        });
    } else {
        photoGallery.innerHTML = "<p>No photos available.</p>";
    }
}
