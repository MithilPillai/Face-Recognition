from pymongo import MongoClient
from gridfs import GridFS
import os

def process_image(image_data):
    # Connect to the MongoDB server
    client = MongoClient('mongodb://localhost:27017/')

    # Select the database
    db = client['image-upload']  # Replace 'image-upload' with your actual database name

    # Create a GridFS instance
    fs = GridFS(db, collection='userImages')  # Replace 'userImages' with the correct collection name

    # Define the folder path where the images will be saved
    output_folder_path = r'C:\Users\admin\Desktop\chimzlab\user_images'

    # Create the output folder if it doesn't already exist
    if not os.path.exists(output_folder_path):
        os.makedirs(output_folder_path)

    # Query the Files collection to get a list of files
    file_list = fs.find()

    # Iterate through each file in GridFS
    for file_document in file_list:
        # Get the file ID
        file_id = file_document._id
        
        # Get the filename
        filename = file_document.filename
        
        # Retrieve the file data using GridFS
        with fs.get(file_id) as grid_file:
            # Open a new file in the output folder for writing the binary data
            file_path = os.path.join(output_folder_path, filename)
            with open(file_path, 'wb') as file:
                # Read the data from the GridFS file and write it to the local file
                file.write(grid_file.read())
            
            # Print a success message
            print(f'Successfully saved {filename} to {output_folder_path}')

    # Close the MongoDB client connection
    client.close()

# Ensure this is a callable script for other uses if needed
if __name__ == '__main__':
    image_data = 'example_data'
    process_image(image_data)
