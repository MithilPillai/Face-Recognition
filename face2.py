
# working 14 mins for 19 pics no side face accuracy (11/19(5 with face) (2/5 side faces) )
import face_recognition
import os
from collections import defaultdict
import shutil
from PIL import Image, ImageDraw
import cv2


# Load known face encodings and names
known_face_encodings = []
known_face_names = []

# Load images and encodings from the "train" directory
train_directory = r'D:\chimzlab\public\temp\Mithil'
for filename in os.listdir(train_directory):
    image = face_recognition.load_image_file(os.path.join(train_directory, filename))
    encodings = face_recognition.face_encodings(image)
    if len(encodings) > 0:
        encoding = encodings[0]
        name = os.path.splitext(filename)[0]  # Remove file extension
        known_face_encodings.append(encoding)
        known_face_names.append(name)
    # else:
        # print(f"No faces found in {filename}. Skipping this image.")

# Function to recognize faces in an image
def recognize_faces(image_path, filename, output_directory):
    unknown_image = face_recognition.load_image_file(image_path)
    unknown_face_encodings = face_recognition.face_encodings(unknown_image)
    face_locations = face_recognition.face_locations(unknown_image)
    face_names = defaultdict(list)
    
    for face_encoding, (top, right, bottom, left) in zip(unknown_face_encodings, face_locations):
        # Compare the unknown encoding to known encodings
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.5) # Adjust tolerance as needed
        name = "Unknown"
        if True in matches:
            matched_index = matches.index(True)
            name = known_face_names[matched_index]
        
        face_names[name].append((top, right, bottom, left))
    
    return face_names

# Recognize faces in all images in the "input" folder
input_directory = r'D:\chimzlab\public\events\665ff422721d56e3541fbf8e'
output_directory = r'D:\chimzlab\output'
os.makedirs(output_directory, exist_ok=True)

for filename in os.listdir(input_directory):
    image_path = os.path.join(input_directory, filename)
    known_filename = os.path.splitext(filename)[0] + ".jpg"  # Assuming known images have .jpg extension
    face_names = recognize_faces(image_path, known_filename, output_directory)
    for name in face_names:
        if name != "Unknown":
            output_image_path = os.path.join(output_directory, f"{name}_{known_filename}")
            shutil.copy(image_path, output_image_path)
            print(f"Image saved successfully: {output_image_path}")
