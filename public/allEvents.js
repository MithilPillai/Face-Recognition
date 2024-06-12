window.onload = function () {
  fetchAllEvents();
};

function fetchAllEvents() {
  fetch('/get-user-events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId: localStorage.getItem("userId") })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        displayEvents(data.events);
        document.getElementById("allevents").style.display = "flex";
      } else {
        console.error("Failed to fetch events.");
      }
    })
    .catch(error => {
      console.error('Error fetching events:', error);
    });
}

function displayEvents(events) {
  const eventList = document.getElementById("eventList");
  if (events.length === 0) return;
  eventList.innerHTML = "";
  for (const event of events) {
    const eventCard = document.createElement("a");
    eventCard.className = "event-card";
    eventCard.href = `event.html?id=${event._id}`;
    const h3 = document.createElement("h3");
    h3.textContent = event.name;
    eventCard.appendChild(h3);

    const p = document.createElement("p");
    p.textContent = `${event.date} - ${event.venue}`;
    eventCard.appendChild(p);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `<i class="fa-regular fa-trash-can"></i>`;
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = function (e) {
      e.stopPropagation();
      e.preventDefault();
      fetch(`/events/${event._id}`, {
        method: "DELETE"
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            window.location.reload();
          } else {
            console.error("Failed to delete event.");
          }
        })
        .catch(error => {
          console.error("Error deleting event:", error);
        });
    }
    eventCard.appendChild(deleteBtn);
    eventList.appendChild(eventCard);
  }
}

function changeTab(evt, tabName) {
  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "flex";
  evt.currentTarget.className += " active";
}



// Example of how you might handle form submission in home.js
document.getElementById('eventForm').addEventListener('submit', function (event) {
  event.preventDefault();
  const eventName = document.getElementById('eventName').value;
  const venue = document.getElementById('venue').value;
  const eventDate = document.getElementById('eventDate').value;
  const eventCategory = document.getElementById('eventCategory').value;
  const userId = localStorage.getItem('userId');  // Assuming userId is stored in localStorage

  // Send the event data to the server

  fetch('/create-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: eventName, venue: venue, date: eventDate, category: eventCategory, userId: userId })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Event created successfully!',
          text: 'Your event has been created and is ready for upload.',
          iconColor: "black"
        })
        // Store the event ID in localStorage or pass it directly if needed
        localStorage.setItem('currentEventId', data.eventId);  // Save the event ID for later use in upload.html

        setTimeout(() => {
          window.location.href = 'event.html?id=' + data.eventId;
        }, 1500);

        // Redirect to the upload.html page
      } else {
        alert('Failed to create event: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    });
});
