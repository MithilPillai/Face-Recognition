function getImageListTemplate(images) {
  let template = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image List</title>
    <link rel="stylesheet" href="/images.css"></link>
    <link rel="stylesheet" href="/home.css"></link>
  </head>
  <body class="">
    <div class="navbar">
      <ul class="links">
          <a href="/home.html">Home</a>
      </ul>
    </div>
    
    <div class="container">
    <h1 class="title">Image List</h1>

  `;
  if (images.length === 0) {
    template += '<div class="not-found">No images found</div>';
  } else {
    template += '<div class="image-list image-grid">';
    for (let image of images) {
      template += `
        <div class='image-wrapper'>
          <img src='${image.url}' alt='${image.filename}'>
          <div class='image-details'>
            <span class='image-name'>${image.filename}</span>
          </div>
        </div>
      `;
    }
    template += '</div>';
  }
  template += `
      </div>
    </div>
    <script src="/menu.js"></script>
  </body>
  </html>
  `;
  return template;
}



function getEventImagesTemplate(images) {
  let template = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Images List</title>
    <link rel="stylesheet" href="/home.css"></link>
    <link rel="stylesheet" href="/event.css"></link>
  </head>
  <body class="">
    <div class="navbar">
      <ul class="links">
          <a href="/home.html">Home</a>
      </ul>
    </div>
    
    <div class="photoListContainer">
    <h2 class="photoListTitle">Photos</h2>
    <div id="photoList" class="photoList">
  `;
  if (images.length === 0) {
    template += '<div class="not-found">No images found</div>';
  } else {
    for (let image of images) {
      template += `<img class="photo" src='${image.url}' alt='${image.filename}'>`;
    }
  }
  template += `
      </div>
    </div>
    <script src="/menu.js"></script>
  </body>
  </html>
  `;
  return template;
}



module.exports = { getImageListTemplate, getEventImagesTemplate };
