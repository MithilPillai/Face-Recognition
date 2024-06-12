
function toggleMenu() {
  var menu = document.getElementById("menuItems");
  menu.classList.toggle("active");
}

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

function copyToClipboard(button) {
  const eventId = button.getAttribute("data-event-id");
  const eventName = button.getAttribute("data-event-name");
  
  console.log("Copying Event ID:", eventId);  // Log Event ID
  console.log("Copying Event Name:", eventName);  // Log Event Name

  if (!eventId || !eventName) {
    console.error("Missing event ID or name");
    return;
  }

  const link = `/clientImages.html?id=${eventId}&name=${encodeURIComponent(eventName)}`;

  console.log("Generated link:", link);  // Log the generated link

  // Copy link to clipboard
  navigator.clipboard.writeText("http://localhost:3000" + link)
  // navigator.clipboard.writeText("https://627f-43-252-34-223.ngrok-free.app" + link)
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

function addEvents(events) {
  const eventsList = document.getElementById("eventList");
  if (events.length > 0) {
    eventsList.innerHTML = ""; // clear the list
    events.forEach((event) => {
      const eventCard = document.createElement("a");
      eventCard.className = "event-card";
      eventCard.href = `event.html?id=${event._id}`;

      const h3 = document.createElement("h3");
      h3.textContent = event.name;
      eventCard.appendChild(h3);

      const p = document.createElement("p");
      p.textContent = event.venue;
      eventCard.appendChild(p);

      eventsList.appendChild(eventCard);
    });
  }
}

window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");

  if (!eventId) {
    console.error("Event ID is missing in the URL.");
    return;
  }

  fetchEventDetails(eventId);
};

function fetchEventDetails(eventId) {
  fetch(`/events/${eventId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        populateEventDetails(data.event);
      } else {
        console.error("Failed to fetch event details.");
      }
    })
    .catch((error) => {
      console.error("Error fetching event details:", error);
    });
}

function populateEventDetails(event) {
  // Implement the logic to populate the event details in the HTML
  console.log(event);

  const pageTitle = document.getElementById("pageTitle");
  pageTitle.innerHTML = event.name;

  const copyButton = document.getElementById("copyLinkBtn");
  copyButton.setAttribute("data-event-id", event._id);
  copyButton.setAttribute("data-event-name", event.name);

  const photos = event.photos;
  addPhotos(photos);
}

function addPhotos(photos) {
  const photoList = document.getElementById("photoList");
  const urlParams = new URLSearchParams(window.location.search);
  if (photos.length > 0) {
    const eventId = urlParams.get("id");
    photoList.innerHTML = ""; // Clear existing photos

    photos.forEach((photo) => {
      const img = document.createElement("img");
      img.classList.add("photo");
      img.src = `/events/${eventId}/${photo.path}`;
      img.alt = photo.filename;
      img.classList.add("photo");

      photoList.appendChild(img);
    });
  }
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("validationModalClose").addEventListener("click", function() {
    document.getElementById("validationModal").style.display = "none";
  });
});

document.getElementById("uploadForm").addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent the form from submitting normally
  const form = event.target;
  const fileInput = form.querySelector('input[type="file"]');

  if (!fileInput.files.length) {
    showModal("Please select at least one file to upload."); // Show the custom modal with the message
    return;
  }

  const formData = new FormData();
  const fileCount = fileInput.files.length;
  for (let i = 0; i < fileCount; i++) {
    formData.append("images", fileInput.files[i]);
  }

  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  const eventId = params.get("id");

  fetch(`/events/${eventId}`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.text())
    .then((message) => {
      console.log(message); // You can show success/error message to user
      window.location.reload();
    })
    .catch((error) => {
      console.error("Error uploading photos:", error);
    });
});

function showModal(message) {
  const modal = document.getElementById("validationModal");
  const modalText = modal.querySelector("p");
  modalText.textContent = message;
  modal.style.display = "block";
}

// Close the modal when the user clicks on <span> (x)
document.querySelector(".validationModal .close").addEventListener("click", function() {
  this.parentElement.parentElement.style.display = "none";
});

document.getElementById("copyLinkBtn").addEventListener("click", function (event) {
  const link = event.target.getAttribute("data-link");
  this.innerHTML = "Copied!";
  navigator.clipboard
    .writeText("http://localhost:3000" + link)
    // .writeText("https://627f-43-252-34-223.ngrok-free.app" + link)
    .then(() => {
      console.log("Link copied to clipboard");
      setTimeout(() => {
        this.innerHTML = "Copy Link";
      }, 1000);
    })
    .catch((err) => {
      console.error("Failed to copy link:", err);
    });
});
