window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");
  const eventName = decodeURIComponent(urlParams.get("name"));

  if (!eventId || eventId === "null") {
      console.error("Invalid or missing event ID.");
      return;
  }

  if (!eventName) {
      console.error("Event name is missing in the URL.");
      return;
  }

  fetchEventDetails(eventId, eventName);

  document.getElementById('scanButton').addEventListener('click', () => startFaceScan(eventId));
};

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

function startFaceScan(eventId) {
  const video = document.getElementById('video');
  video.style.display = 'block';
  startVideo();

  const directions = ["Please look straight.", "Please turn left.", "Please turn right.", "Please tilt your head up.", "Please tilt your head down."];
  let pictureCount = 0;
  const maxPictures = directions.length;

  const captureAndUpload = async (direction, eventId) => {
      console.log(direction);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg');

      try {
          await uploadImageToServer(imageData, eventId, 'username');
          pictureCount++;

          if (pictureCount < maxPictures) {
              captureAndUpload(directions[pictureCount], eventId);
          } else {
              console.log('All pictures captured and uploaded.');
              video.srcObject.getTracks().forEach(track => track.stop());
              video.style.display = 'none';

              await startRecognition(eventId, 'username');
          }
      } catch (error) {
          console.error('Upload failed:', error);
      }
  };

  captureAndUpload(directions[pictureCount], eventId);
}


async function uploadImageToServer(imageData, eventId, username) {
  try {
      const response = await fetch('/upload-temp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData, eventId, username })
      });

      if (!response.ok) {
          const message = `Failed to upload image. Status: ${response.status}`;
          throw new Error(message);
      }

      return await response.json();
  } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
  }
}

async function startRecognition(eventId, username) {
  try {
      const response = await fetch('/start-recognition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, username })
      });

      if (!response.ok) {
          const message = `Failed to start recognition. Status: ${response.status}`;
          throw new Error(message);
      }

      const userImages = await response.json();
      console.log('Recognition result:', userImages);
      displayUserImages(userImages, eventId, username);
  } catch (error) {
      console.error('Error starting recognition:', error);
      throw error;
  }
}

function displayUserImages(userImages, eventId, username) {
  const userImagesContainer = document.getElementById("userImages");
  userImagesContainer.innerHTML = "";

  userImages.forEach(userImage => {
      for (const [username, images] of Object.entries(userImage)) {
          const userContainer = document.createElement("div");
          userContainer.classList.add("user-container");
          const userHeader = document.createElement("h3");
          userHeader.textContent = username;
          userContainer.appendChild(userHeader);

          images.forEach(image => {
              const img = document.createElement("img");
              img.src = image.path;
              img.alt = image.filename;
              userContainer.appendChild(img);
          });

          userImagesContainer.appendChild(userContainer);
      }
  });

  const copyLinkButton = document.createElement('button');
  copyLinkButton.textContent = 'Copy Link to My Photos';
  copyLinkButton.className = 'btn-secondary';
  copyLinkButton.onclick = () => {
      const link = `http://localhost:3000/clientImages.html?user=${username}&event=${eventId}`;
      navigator.clipboard.writeText(link)
          .then(() => {
              alert('Link copied to clipboard');
          })
          .catch(err => {
              console.error('Failed to copy link:', err);
          });
  };
  userImagesContainer.appendChild(copyLinkButton);
}
