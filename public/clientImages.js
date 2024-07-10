window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("id");
    const eventName = decodeURIComponent(urlParams.get("name"));
  
    console.log("eventId:", eventId);
    console.log("eventName:", eventName);
  
    if (!eventId || eventId === "null") {
      console.error("Invalid or missing event ID.");
      return;
    }
  
    if (!eventName) {
      console.error("Event name is missing in the URL.");
      return;
    }
  
    fetchEventDetails(eventId, eventName);
  
    document
      .getElementById("scanButton")
      .addEventListener("click", () => openUsernameModal(eventId));
  
    const copySortedLinkBtn = document.getElementById("copySortedLinkBtn");
    if (copySortedLinkBtn) {
      copySortedLinkBtn.addEventListener("click", () => copySortedLink(eventId));
    }
  };
  
  function openUsernameModal(eventId) {
    const usernameModal = document.getElementById("usernameModal");
    const submitButton = document.getElementById("submitUsername");
  
    usernameModal.style.display = "block";
  
    submitButton.onclick = () => {
      const usernameInput = document.getElementById("usernameInput").value.trim();
      if (usernameInput) {
        usernameModal.style.display = "none";
        startFaceScan(eventId, usernameInput);
      } else {
        alert("Please enter a username.");
      }
    };
  }
  
  function startFaceScan(eventId, username) {
    const video = document.getElementById("video");
    video.style.display = "block";
    startVideo();
  
    const directions = [
      "Please look straight.",
      "Please turn left.",
      "Please turn right.",
      "Please tilt your head up.",
      "Please tilt your head down.",
    ];
    let pictureCount = 0;
    const maxPictures = directions.length;
  
    console.log("Starting face scan for event:", eventId, "and user:", username);
  
    const captureAndUpload = async (direction, eventId) => {
      console.log(direction); // Log direction to console instead of showing modal
  
      await new Promise((resolve) => setTimeout(resolve, 2000));
  
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");
  
      try {
        await uploadImageToServer(imageData, eventId, username);
        pictureCount++;
  
        if (pictureCount < maxPictures) {
          captureAndUpload(directions[pictureCount], eventId);
        } else {
          console.log("All pictures captured and uploaded.");
          video.srcObject.getTracks().forEach((track) => track.stop());
          video.style.display = "none";
  
          await startRecognition(eventId, username);
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    };
  
    captureAndUpload(directions[pictureCount], eventId);
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
    // Handle image modal close functionality
    const imageModal = document.getElementById("imageModal");
    const imageModalClose = imageModal.querySelector(".close");
  
    if (imageModalClose) {
      imageModalClose.onclick = function () {
        imageModal.style.display = "none";
      };
    }
  
    window.onclick = function (event) {
      if (event.target === imageModal) {
        imageModal.style.display = "none";
      }
    };
  
    // Handle username modal close functionality
    const usernameModal = document.getElementById("usernameModal");
    const usernameModalClose = usernameModal.querySelector(".close");
  
    if (usernameModalClose) {
      usernameModalClose.onclick = function () {
        usernameModal.style.display = "none";
      };
    }
  
    window.onclick = function (event) {
      if (event.target === usernameModal) {
        usernameModal.style.display = "none";
      }
    };
  });
  
  function fetchEventDetails(eventId, eventName) {
    fetch(`/events/${eventId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          populateEventDetails(data.event, eventName);
        } else {
          console.error("Failed to fetch event details.");
        }
      })
      .catch((error) => {
        console.error("Error fetching event details:", error);
      });
  }
  
  function populateEventDetails(event, eventName) {
    const eventNameElement = document.getElementById("eventName");
    eventNameElement.textContent = eventName;
  
    const photoGallery = document.getElementById("photoGallery");
    const photos = event.photos;
    if (photos.length > 0) {
      photoGallery.innerHTML = "";
      photos.forEach((photo) => {
        const photoContainer = document.createElement("div");
        photoContainer.classList.add("photo-container");
        const img = document.createElement("img");
        img.classList.add("photo");
        img.src = `/events/${event._id}/${photo.path}`;
        img.alt = photo.filename;
        img.addEventListener("click", function () {
          openModal(img.src);
        });
        photoContainer.appendChild(img);
        photoGallery.appendChild(photoContainer);
      });
    } else {
      photoGallery.innerHTML = "<p>No photos available.</p>";
    }
  }
  
  function startVideo() {
    const video = document.getElementById("video");
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => (video.srcObject = stream))
      .catch((err) => console.error("Error accessing webcam: ", err));
  }
  
  async function uploadImageToServer(imageData, eventId, username) {
    try {
      const response = await fetch("/upload-temp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, eventId, username }),
      });
  
      if (!response.ok) {
        const message = `Failed to upload image. Status: ${response.status}`;
        throw new Error(message);
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }
  
  async function startRecognition(eventId, username) {
    try {
      const response = await fetch("/start-recognition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, username }),
      });
  
      if (!response.ok) {
        const message = `Failed to start recognition. Status: ${response.status}`;
        throw new Error(message);
      }
  
      const data = await response.json();
  
      if (!data.success) {
        throw new Error("Failed to start recognition.");
      }
  
      console.log("Recognition result:", data.userImages);
  
      if (data.userImages !== null) {
        window
          .open(
            `userImages.html?eventId=${eventId}&username=${username}`,
            "_blank"
          )
          .focus();
      } else {
        console.log("No user images available.");
      }
    } catch (error) {
      console.error("Error starting recognition:", error);
      throw error;
    }
  }
  
  function copySortedLink(eventId) {
    const username = prompt("Enter Your Name");
    if (!username) {
      console.error("Username is missing.");
      return;
    }
    const link = `http://localhost:3000/userImages.html?eventId=${encodeURIComponent(
      eventId
    )}&username=${encodeURIComponent(username)}`;
  
    navigator.clipboard
      .writeText(link)
      .then(() => {
        console.log("Link copied to clipboard");
        alert("Link to your images has been copied!");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
      });
  }
  
  function displayUserImages(userImages, username) {
    const userImagesContainer = document.getElementById("userImages");
    userImagesContainer.innerHTML = "";
  
    const userContainer = document.createElement("div");
    userContainer.classList.add("user-container");
    const userHeader = document.createElement("h3");
    userHeader.textContent = username;
    userContainer.appendChild(userHeader);
  
    userImages.forEach((image) => {
      const img = document.createElement("img");
      img.src = image;
      img.alt = "User Photo";
      userContainer.appendChild(img);
    });
  
    userImagesContainer.appendChild(userContainer);
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    // Handle username modal close functionality
    const usernameModal = document.getElementById("usernameModal");
    const usernameModalClose = usernameModal.querySelector(".close");
  
    if (usernameModalClose) {
      usernameModalClose.onclick = function () {
        usernameModal.style.display = "none";
      };
    }
  
    window.onclick = function (event) {
      if (event.target === usernameModal) {
        usernameModal.style.display = "none";
      }
    };
  
    // Handle image modal close functionality
    const imageModal = document.getElementById("imageModal");
    const imageModalClose = imageModal.querySelector(".close");
  
    if (imageModalClose) {
      imageModalClose.onclick = function () {
        imageModal.style.display = "none";
      };
    }
  
    window.onclick = function (event) {
      if (event.target === imageModal) {
        imageModal.style.display = "none";
      }
    };
  });
  

//////////////


// window.onload = function () {
//   const urlParams = new URLSearchParams(window.location.search);
//   const eventId = urlParams.get("id");
//   const eventName = decodeURIComponent(urlParams.get("name"));

//   console.log("eventId:", eventId);
//   console.log("eventName:", eventName);

//   if (!eventId || eventId === "null") {
//     console.error("Invalid or missing event ID.");
//     return;
//   }

//   if (!eventName) {
//     console.error("Event name is missing in the URL.");
//     return;
//   }

//   fetchEventDetails(eventId, eventName);

//   document
//     .getElementById("scanButton")
//     .addEventListener("click", () => openUsernameModal(eventId));

//   const copySortedLinkBtn = document.getElementById("copySortedLinkBtn");
//   if (copySortedLinkBtn) {
//     copySortedLinkBtn.addEventListener("click", () => copySortedLink(eventId));
//   }
// };

// function openUsernameModal(eventId) {
//   const usernameModal = document.getElementById("usernameModal");
//   const submitButton = document.getElementById("submitUsername");

//   usernameModal.style.display = "block";

//   submitButton.onclick = () => {
//     const usernameInput = document.getElementById("usernameInput").value.trim();
//     if (usernameInput) {
//       usernameModal.style.display = "none";
//       startFaceScan(eventId, usernameInput);
//     } else {
//       alert("Please enter a username.");
//     }
//   };
// }

// function startFaceScan(eventId, username) {
//   const video = document.getElementById("video");
//   video.style.display = "block";
//   startVideo();

//   const directions = [
//     "Please look straight.",
//     "Please turn left.",
//     "Please turn right.",
//     "Please tilt your head up.",
//     "Please tilt your head down.",
//   ];
//   let pictureCount = 0;
//   const maxPictures = directions.length;

//   console.log("Starting face scan for event:", eventId, "and user:", username);

//   const captureAndUpload = async (direction, eventId) => {
//     console.log(direction); // Log direction to console instead of showing modal

//     await new Promise((resolve) => setTimeout(resolve, 2000));

//     const canvas = document.createElement("canvas");
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
//     const imageData = canvas.toDataURL("image/jpeg");

//     try {
//       await uploadImageToServer(imageData, eventId, username);
//       pictureCount++;

//       if (pictureCount < maxPictures) {
//         captureAndUpload(directions[pictureCount], eventId);
//       } else {
//         console.log("All pictures captured and uploaded.");
//         video.srcObject.getTracks().forEach((track) => track.stop());
//         video.style.display = "none";

//         await startRecognition(eventId, username);
//       }
//     } catch (error) {
//       console.error("Upload failed:", error);
//     }
//   };

//   captureAndUpload(directions[pictureCount], eventId);
// }

// // function openModal(src) {
// //     const modal = document.getElementById("imageModal");
// //     const modalImg = document.getElementById("modalImage");
// //     const downloadBtn = document.getElementById("downloadBtn");
// //     modal.style.display = "flex";
// //     modalImg.src = src;
// //     downloadBtn.href = src;
// // }

// // document.addEventListener("DOMContentLoaded", function () {
// //     const modal = document.getElementById("imageModal");
// //     const span = document.getElementsByClassName("close")[0];

// //     if (span) {
// //         span.onclick = function () {
// //             modal.style.display = "none";
// //         };
// //     }

// //     window.onclick = function (event) {
// //         if (event.target === modal) {
// //             modal.style.display = "none";
// //         }
// //     };
// // });

// function openModal(src) {
//     const modal = document.getElementById("imageModal");
//     const modalImg = document.getElementById("modalImage");
//     const downloadBtn = document.getElementById("downloadBtn");
//     modal.style.display = "flex";
//     modalImg.src = src;
//     downloadBtn.href = src;
// }

// document.addEventListener("DOMContentLoaded", function() {
//     const modal = document.getElementById("imageModal");
//     const span = document.querySelector("#imageModal .close");

//     if (span) {
//         span.onclick = function() {
//             modal.style.display = "none";
//         };
//     }

//     window.onclick = function(event) {
//         if (event.target === modal) {
//             modal.style.display = "none";
//         }
//     };
// });

// function fetchEventDetails(eventId, eventName) {
//   fetch(`/events/${eventId}`)
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("Network response was not ok " + response.statusText);
//       }
//       return response.json();
//     })
//     .then((data) => {
//       if (data.success) {
//         populateEventDetails(data.event, eventName);
//       } else {
//         console.error("Failed to fetch event details.");
//       }
//     })
//     .catch((error) => {
//       console.error("Error fetching event details:", error);
//     });
// }

// function populateEventDetails(event, eventName) {
//   const eventNameElement = document.getElementById("eventName");
//   eventNameElement.textContent = eventName;

//   const photoGallery = document.getElementById("photoGallery");
//   const photos = event.photos;
//   if (photos.length > 0) {
//     photoGallery.innerHTML = "";
//     photos.forEach((photo) => {
//       const photoContainer = document.createElement("div");
//       photoContainer.classList.add("photo-container");
//       const img = document.createElement("img");
//       img.classList.add("photo");
//       img.src = `/events/${event._id}/${photo.path}`;
//       img.alt = photo.filename;
//       img.addEventListener("click", function () {
//         openModal(img.src);
//       });
//       photoContainer.appendChild(img);
//       photoGallery.appendChild(photoContainer);
//     });
//   } else {
//     photoGallery.innerHTML = "<p>No photos available.</p>";
//   }
// }

// function startVideo() {
//   const video = document.getElementById("video");
//   navigator.mediaDevices
//     .getUserMedia({ video: {} })
//     .then((stream) => (video.srcObject = stream))
//     .catch((err) => console.error("Error accessing webcam: ", err));
// }

// async function uploadImageToServer(imageData, eventId, username) {
//   try {
//     const response = await fetch("/upload-temp", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ imageData, eventId, username }),
//     });

//     if (!response.ok) {
//       const message = `Failed to upload image. Status: ${response.status}`;
//       throw new Error(message);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error uploading image:", error);
//     throw error;
//   }
// }

// async function startRecognition(eventId, username) {
//   try {
//     const response = await fetch("/start-recognition", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ eventId, username }),
//     });

//     if (!response.ok) {
//       const message = `Failed to start recognition. Status: ${response.status}`;
//       throw new Error(message);
//     }

//     const data = await response.json();

//     if (!data.success) {
//       throw new Error("Failed to start recognition.");
//     }

//     console.log("Recognition result:", data.userImages);

//     if (data.userImages !== null) {
//       window
//         .open(
//           `userImages.html?eventId=${eventId}&username=${username}`,
//           "_blank"
//         )
//         .focus();
//     } else {
//       console.log("No user images available.");
//     }
//   } catch (error) {
//     console.error("Error starting recognition:", error);
//     throw error;
//   }
// }

// function copySortedLink(eventId) {
//   const username = prompt("Enter Your Name");
//   if (!username) {
//     console.error("Username is missing.");
//     return;
//   }
//   const link = `http://localhost:3000/userImages.html?eventId=${encodeURIComponent(
//     eventId
//   )}&username=${encodeURIComponent(username)}`;

//   navigator.clipboard
//     .writeText(link)
//     .then(() => {
//       console.log("Link copied to clipboard");
//       alert("Link to your images has been copied!");
//     })
//     .catch((err) => {
//       console.error("Failed to copy link:", err);
//     });
// }

// function displayUserImages(userImages, username) {
//   const userImagesContainer = document.getElementById("userImages");
//   userImagesContainer.innerHTML = "";

//   const userContainer = document.createElement("div");
//   userContainer.classList.add("user-container");
//   const userHeader = document.createElement("h3");
//   userHeader.textContent = username;
//   userContainer.appendChild(userHeader);

//   userImages.forEach((image) => {
//     const img = document.createElement("img");
//     img.src = image;
//     img.alt = "User Photo";
//     userContainer.appendChild(img);
//   });

//   userImagesContainer.appendChild(userContainer);
// }

// document.addEventListener("DOMContentLoaded", function () {
//   const modal = document.getElementById("usernameModal");
//   const span = document.getElementsByClassName("close")[0];

//   if (span) {
//     span.onclick = function () {
//       modal.style.display = "none";
//     };
//   }

//   window.onclick = function (event) {
//     if (event.target === modal) {
//       modal.style.display = "none";
//     }
//   };
// });
