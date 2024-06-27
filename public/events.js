// function toggleMenu() {
//   var menu = document.getElementById("menuItems");
//   menu.classList.toggle("active");
// }

// function toggleSettingsMenu() {
//   var settingsMenuItems = document.getElementById("settingsMenuItems");
//   if (settingsMenuItems.style.display === "block") {
//     settingsMenuItems.style.display = "none";
//     settingsMenuItems.classList.remove("active");
//   } else {
//     settingsMenuItems.style.display = "block";
//     settingsMenuItems.classList.add("active");
//   }
// }

// function copyToClipboard(button) {
//   const eventId = button.getAttribute("data-event-id");
//   const eventName = button.getAttribute("data-event-name");

//   console.log("Copying Event ID:", eventId);  // Log Event ID
//   console.log("Copying Event Name:", eventName);  // Log Event Name

//   if (!eventId || !eventName) {
//     console.error("Missing event ID or name");
//     return;
//   }

//   const link = `/clientImages.html?id=${eventId}&name=${encodeURIComponent(eventName)}`;

//   console.log("Generated link:", link);  // Log the generated link

//   // Copy link to clipboard
//   navigator.clipboard.writeText("http://localhost:3000" + link)
//     .then(() => {
//       console.log("Link copied to clipboard");
//       button.innerHTML = "Copied!";
//       setTimeout(() => {
//         button.innerHTML = "Copy Link";
//       }, 2000);
//     })
//     .catch((err) => {
//       console.error("Failed to copy link:", err);
//     });
// }

// function addEvents(events) {
//   const eventsList = document.getElementById("eventList");
//   if (events.length > 0) {
//     eventsList.innerHTML = ""; // clear the list
//     events.forEach((event) => {
//       const eventCard = document.createElement("a");
//       eventCard.className = "event-card";
//       eventCard.href = `event.html?id=${event._id}`;

//       const h3 = document.createElement("h3");
//       h3.textContent = event.name;
//       eventCard.appendChild(h3);

//       const p = document.createElement("p");
//       p.textContent = event.venue;
//       eventCard.appendChild(p);

//       eventsList.appendChild(eventCard);
//     });
//   }
// }

// window.onload = function () {
//   const urlParams = new URLSearchParams(window.location.search);
//   const eventId = urlParams.get("id");

//   if (!eventId) {
//     console.error("Event ID is missing in the URL.");
//     return;
//   }

//   fetchEventDetails(eventId);
// };

// function fetchEventDetails(eventId) {
//   fetch(`/events/${eventId}`)
//     .then((response) => response.json())
//     .then((data) => {
//       if (data.success) {
//         populateEventDetails(data.event);
//       } else {
//         console.error("Failed to fetch event details.");
//       }
//     })
//     .catch((error) => {
//       console.error("Error fetching event details:", error);
//     });
// }

// function populateEventDetails(event) {
//   // Implement the logic to populate the event details in the HTML
//   console.log(event);

//   const pageTitle = document.getElementById("pageTitle");
//   pageTitle.innerHTML = event.name;

//   const copyButton = document.getElementById("copyLinkBtn");
//   copyButton.setAttribute("data-event-id", event._id);
//   copyButton.setAttribute("data-event-name", event.name);

//   const photos = event.photos;
//   addPhotos(photos);
// }

// function addPhotos(photos) {
//   const photoList = document.getElementById("photoList");
//   const urlParams = new URLSearchParams(window.location.search);
//   if (photos.length > 0) {
//     const eventId = urlParams.get("id");
//     photoList.innerHTML = ""; // Clear existing photos

//     photos.forEach((photo) => {
//       const imgContainer = document.createElement("div");
//       imgContainer.classList.add("photo-container");

//       const img = document.createElement("img");
//       img.src = `/events/${eventId}/${photo.path}`;
//       img.alt = photo.filename;
//       img.classList.add("photo");
//       img.addEventListener('click', function() {
//         openModal(img.src);
//       });

//       const actionsDiv = document.createElement('div');
//       actionsDiv.classList.add('photo-actions');

//       const deleteBtn = document.createElement('button');
//       deleteBtn.classList.add('action-btn');
//       deleteBtn.innerHTML = 'Delete';
//       deleteBtn.addEventListener('click', function(e) {
//         e.stopPropagation();
//         // Delete image logic here
//         // For demonstration, remove the photo from the DOM
//         imgContainer.remove();
//         fetch(`/events/${eventId}/photos/${photo._id}`, {
//           method: 'DELETE'
//         }).then(response => response.json())
//           .then(data => {
//             if (!data.success) {
//               alert('Error deleting image');
//             }
//           }).catch(err => console.error(err));
//       });

//       const downloadBtn = document.createElement('button');
//       downloadBtn.classList.add('action-btn');
//       downloadBtn.innerHTML = 'Download';
//       downloadBtn.addEventListener('click', function(e) {
//         e.stopPropagation();
//         // Create a temporary link to download the image
//         const link = document.createElement('a');
//         link.href = img.src;
//         link.download = img.src.split('/').pop();
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//       });

//       actionsDiv.appendChild(deleteBtn);
//       actionsDiv.appendChild(downloadBtn);
//       imgContainer.appendChild(img);
//       imgContainer.appendChild(actionsDiv);
//       photoList.appendChild(imgContainer);
//     });
//   }
// }

// // Modal functions
// function openModal(src) {
//   const modal = document.getElementById("imageModal");
//   const modalImg = document.getElementById("modalImage");
//   modal.style.display = "flex";
//   modalImg.src = src;
// }

// const modal = document.getElementById("imageModal");
// const span = document.getElementsByClassName("close")[0];

// span.onclick = function() {
//   modal.style.display = "none";
// }

// window.onclick = function(event) {
//   if (event.target === modal) {
//     modal.style.display = "none";
//   }
// }

// document.addEventListener("DOMContentLoaded", function() {
//   document.getElementById("validationModalClose").addEventListener("click", function() {
//     document.getElementById("validationModal").style.display = "none";
//   });
// });

// document.getElementById("uploadForm").addEventListener("submit", function(event) {
//   event.preventDefault(); // Prevent the form from submitting normally
//   const form = event.target;
//   const fileInput = form.querySelector('input[type="file"]');

//   if (!fileInput.files.length) {
//     showModal("Please select at least one file to upload."); // Show the custom modal with the message
//     return;
//   }

//   const formData = new FormData();
//   const fileCount = fileInput.files.length;
//   for (let i = 0; i < fileCount; i++) {
//     formData.append("images", fileInput.files[i]);
//   }

//   const url = new URL(window.location.href);
//   const params = new URLSearchParams(url.search);
//   const eventId = params.get("id");

//   fetch(`/events/${eventId}`, {
//     method: "POST",
//     body: formData,
//   })
//     .then((response) => response.text())
//     .then((message) => {
//       console.log(message); // You can show success/error message to user
//       window.location.reload();
//     })
//     .catch((error) => {
//       console.error("Error uploading photos:", error);
//     });
// });

// function showModal(message) {
//   const modal = document.getElementById("validationModal");
//   const modalText = modal.querySelector("p");
//   modalText.textContent = message;
//   modal.style.display = "block";
// }

// // Close the modal when the user clicks on <span> (x)
// document.querySelector(".validationModal .close").addEventListener("click", function() {
//   this.parentElement.parentElement.style.display = "none";
// });

// document.getElementById("copyLinkBtn").addEventListener("click", function (event) {
//   const link = event.target.getAttribute("data-link");
//   this.innerHTML = "Copied!";
//   navigator.clipboard
//     .writeText("http://localhost:3000" + link)
//     .then(() => {
//       console.log("Link copied to clipboard");
//       setTimeout(() => {
//         this.innerHTML = "Copy Link";
//       }, 1000);
//     })
//     .catch((err) => {
//       console.error("Failed to copy link:", err);
//     });
// });


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

  const copylink = "http://localhost:3000" + `/clientImages.html?id=${eventId}&name=${encodeURIComponent(eventName)}`;

  console.log("Generated link:", copylink);  // Log the generated link

  // Copy link to clipboard
  navigator.clipboard.writeText(copylink)
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
  fetch(`events/${eventId}`)
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
  console.log(event);

  const pageTitle = document.getElementById("pageTitle");
  pageTitle.innerHTML = event.name;

  const copyButton = document.getElementById("copyLinkBtn");
  copyButton.setAttribute("data-event-id", event._id);
  copyButton.setAttribute("data-event-name", event.name);

  const photos = event.photos;
  addPhotos(photos);
}

// function addPhotos(photos) {
//   const photoList = document.getElementById("photoList");
//   const urlParams = new URLSearchParams(window.location.search);
//   if (photos.length > 0) {
//     const eventId = urlParams.get("id");
//     photoList.innerHTML = ""; // Clear existing photos

//     photos.forEach((photo) => {
//       const imgContainer = document.createElement("div");
//       imgContainer.classList.add("photo-container");

//       const img = document.createElement("img");
//       img.src = `/events/${eventId}/${photo.path}`;
//       img.alt = photo.filename;
//       img.classList.add("photo");
//       img.addEventListener('click', function() {
//         openModal(img.src);
//       });

//       const actionsDiv = document.createElement('div');
//       actionsDiv.classList.add('photo-actions');

//       const deleteBtn = document.createElement('button');
//       deleteBtn.classList.add('action-btn');
//       deleteBtn.innerHTML = 'Delete';
//       deleteBtn.addEventListener('click', function(e) {
//         e.stopPropagation();
//         // Delete image logic here
//         // For demonstration, remove the photo from the DOM
//         fetch(`/events/${eventId}/photos/${photo._id}`, {
//           method: 'DELETE'
//         }).then(response => response.json())
//           .then(data => {
//             if (data.success) {
//               imgContainer.remove();
//             } else {
//               alert('Error deleting image');
//             }
//           }).catch(err => console.error(err));
//       });

//       const downloadBtn = document.createElement('button');
//       downloadBtn.classList.add('action-btn');
//       downloadBtn.innerHTML = 'Download';
//       downloadBtn.addEventListener('click', function(e) {
//         e.stopPropagation();
//         // Create a temporary link to download the image
//         const link = document.createElement('a');
//         link.href = img.src;
//         link.download = img.src.split('/').pop();
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//       });

//       actionsDiv.appendChild(deleteBtn);
//       actionsDiv.appendChild(downloadBtn);
//       imgContainer.appendChild(img);
//       imgContainer.appendChild(actionsDiv);
//       photoList.appendChild(imgContainer);
//     });
//   }
// }

// Modal functions
// function openModal(src) {
//   const modal = document.getElementById("imageModal");
//   const modalImg = document.getElementById("modalImage");
//   modal.style.display = "flex";
//   modalImg.src = src;
// }

// const modal = document.getElementById("imageModal");
// const span = document.getElementsByClassName("close")[0];

// span.onclick = function() {
//   modal.style.display = "none";
// }

// window.onclick = function(event) {
//   if (event.target === modal) {
//     modal.style.display = "none";
//   }
// }

const selectedImages = [];

function selectImage(e, imageid) {
  if (e.checked) {
    selectedImages.push(imageid);
    document.getElementById(imageid).classList.add("selected");
  } else {
    selectedImages.splice(selectedImages.indexOf(imageid), 1);
    document.getElementById(imageid).classList.remove("selected");
  }
  if (selectedImages.length > 0) {
    document.querySelector(".photoListTitle #photoCount").innerHTML =
      selectedImages.length + " images selected";
  } else {
    document.querySelector(".photoListTitle #photoCount").innerHTML = "";
  }
  console.log(selectedImages);
}

function addPhotos(photos) {
  const photoList = document.getElementById("photoList");
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");
  if (photos.length > 0) {
    photoList.innerHTML = ""; // Clear existing photos

    photos.forEach((photo) => {
      const imgContainer = document.createElement("div");
      imgContainer.classList.add("photo-container");
      imgContainer.id = photo._id;

      const img = document.createElement("img");
      img.src = `events/${eventId}/${photo.path}`;
      img.alt = photo.filename;
      img.classList.add("photo");
      img.addEventListener('click', function () {
        openModal(img.src);
      });

      const actionsDiv = document.createElement('label');
      actionsDiv.htmlFor = "select_" + photo._id;
      actionsDiv.classList.add('photo-actions');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = "select_" + photo._id;
      checkbox.setAttribute('onclick', 'selectImage(this, "' + photo._id + '")');

      actionsDiv.appendChild(checkbox);
      imgContainer.appendChild(img);
      imgContainer.appendChild(actionsDiv);
      photoList.appendChild(imgContainer);
    });
  }
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

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("imageModal");
  const span = document.getElementsByClassName("close")[0];
  const downloadBtn = document.getElementById("downloadBtn");

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

  const closeValidationModalBtn = document.getElementById("validationModalClose");
  if (closeValidationModalBtn) {
    closeValidationModalBtn.addEventListener("click", function () {
      document.getElementById("validationModal").style.display = "none";
    });
  }

  const uploadForm = document.getElementById("uploadForm");
  if (uploadForm) {
    uploadForm.addEventListener("submit", function (event) {
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
  }

  function showModal(message) {
    const modal = document.getElementById("validationModal");
    const modalText = modal.querySelector("p");
    modalText.textContent = message;
    modal.style.display = "block";
  }
});

let deleteMode = false

function toggleDeleteMode() {
  deleteMode = !deleteMode;
  const checkboxes = document.getElementsByClassName('delete-checkbox');
  const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
  for (let checkbox of checkboxes) {
    checkbox.style.display = deleteMode ? 'block' : 'none';
  }
  deleteSelectedBtn.style.display = deleteMode ? 'block' : 'none';
}

function deleteSelectedImages2() {
  const checkboxes = document.getElementsByClassName('delete-checkbox');
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");

  const selectedImages = [];
  for (let checkbox of checkboxes) {
    if (checkbox.checked) {
      const imgContainer = checkbox.closest('.photo-container');
      selectedImages.push(imgContainer);
    }
  }

  if (selectedImages.length > 0) {
    const confirmation = confirm('Are you sure you want to delete the selected images?');
    if (confirmation) {
      selectedImages.forEach(imgContainer => {
        const imgSrc = imgContainer.querySelector('img').src;
        const photoPath = imgSrc.split('/').pop();
        fetch(`/events/${eventId}/photos/${photoPath}`, {
          method: 'DELETE'
        }).then(response => response.json())
          .then(data => {
            if (data.success) {
              imgContainer.remove();
            } else {
              alert('Error deleting image');
            }
          }).catch(err => console.error(err));
      });
    }
  }
}

// Close the modal when the user clicks on <span> (x)
// document.querySelector(".validationModal .close").addEventListener("click", function () {
//   this.parentElement.parentElement.style.display = "none";
// });

// document.getElementById("copyLinkBtn").addEventListener("click", function (event) {
//   const link = event.target.getAttribute("data-link");
//   this.innerHTML = "Copied!";
//   navigator.clipboard
//     .writeText("http://localhost:3000" + link)
//     .then(() => {
//       console.log("Link copied to clipboard");
//       setTimeout(() => {
//         this.innerHTML = "Copy Link";
//       }, 1000);
//     })
//     .catch((err) => {
//       console.error("Failed to copy link:", err);
//     });
// });


const deleteSelectedImages = () => {
  if (selectedImages.length > 0) {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("id");
    const confirmation = confirm('Are you sure you want to delete the selected images?');
    if (confirmation) {
      fetch(`/events/${eventId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ imageIds: selectedImages }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            window.location.reload();
          } else {
            alert('Error deleting account');
          }
        })
    }
  }
}