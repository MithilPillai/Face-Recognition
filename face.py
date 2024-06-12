
import face_recognition
import os
import sys
import shutil
import json
from collections import defaultdict
from pymongo import MongoClient

def preprocess_image(image_path, target_size=(224, 224)):
    image = face_recognition.load_image_file(image_path)
    return image

def load_known_faces(train_directory):
    known_face_encodings = []
    known_face_names = []

    for filename in os.listdir(train_directory):
        image_path = os.path.join(train_directory, filename)
        # print(f"Processing image: {image_path}")
        image = preprocess_image(image_path)
        encodings = face_recognition.face_encodings(image)
        if len(encodings) > 0:
            encoding = encodings[0]
            name = os.path.splitext(filename)[0]  # Remove file extension
            known_face_encodings.append(encoding)
            known_face_names.append(name)
        # else:
            # print(f"No faces found in {filename}. Skipping this image.")

    return known_face_encodings, known_face_names

def recognize_faces(image_path, known_face_encodings, known_face_names):    
    unknown_image = preprocess_image(image_path)
    unknown_face_encodings = face_recognition.face_encodings(unknown_image)
    face_locations = face_recognition.face_locations(unknown_image)
    face_names = defaultdict(list)

    # print(f"Recognizing image: {image_path}")
    # print(f"Found {len(unknown_face_encodings)} faces in the image.")

    for face_encoding, (top, right, bottom, left) in zip(unknown_face_encodings, face_locations):
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.5)
        # print(matches)
        name = "Unknown"
        if True in matches:
            matched_index = matches.index(True)
            name = known_face_names[matched_index]
            # print("name",name)
        if name != "Unknown":  # Only print if the face is not unknown
            face_names[name].append((top, right, bottom, left))
            # print(f"Detected face: {name}")

    return face_names

def process_and_recognize_faces(event_folder, username):
    input_directory = os.path.join(os.getcwd(), 'public', 'events', event_folder)
    user_input_directory = os.path.join(os.getcwd(), 'public', 'temp', username)
    output_directory = os.path.join(os.getcwd(), 'public', 'user_images', username)
    current_dir = os.getcwd()
    # print("running process")
    os.makedirs(output_directory, exist_ok=True)

    known_face_encodings, known_face_names = load_known_faces(user_input_directory)
    # print(known_face_names)
    user_images = []
    imagesarr = []
    
    for filename in os.listdir(input_directory):
        image_path = os.path.join(input_directory, filename)
        face_names = recognize_faces(image_path, known_face_encodings, known_face_names)
        for name, locations in face_names.items():
            if name != "Unknown":
                event_image_path = os.path.join(input_directory, filename)
                output_image_path = os.path.join(output_directory, f"{username}_{filename}")
                shutil.copy(event_image_path, output_image_path)
                user_images.append(output_image_path)
                imagesarr.append(image_path)


    # Delete the temp folder after processing
    # shutil.rmtree(user_input_directory)

    return imagesarr

if __name__ == '__main__':
    event_folder = sys.argv[1] #"6666cf826b3d0df0fb91eb5d"     
    username = sys.argv[2] #"aaa"         

    user_images = process_and_recognize_faces(event_folder, username)

        
    print(json.dumps(user_images))



##########


# import face_recognition
# import os
# import sys
# import shutil
# import json
# from collections import defaultdict
# from pymongo import MongoClient

# def preprocess_image(image_path, target_size=(224, 224)):
#     image = face_recognition.load_image_file(image_path)
#     return image

# def load_known_faces(train_directory):
#     known_face_encodings = []
#     known_face_names = []

#     for filename in os.listdir(train_directory):
#         image_path = os.path.join(train_directory, filename)
#         print(f"Processing image: {image_path}")
#         image = preprocess_image(image_path)
#         encodings = face_recognition.face_encodings(image)
#         if len(encodings) > 0:
#             encoding = encodings[0]
#             name = os.path.splitext(filename)[0]  # Remove file extension
#             known_face_encodings.append(encoding)
#             known_face_names.append(name)
#         # else:
#             # print(f"No faces found in {filename}. Skipping this image.")

#     return known_face_encodings, known_face_names

# def recognize_faces(image_path, known_face_encodings, known_face_names):    
#     unknown_image = preprocess_image(image_path)
#     unknown_face_encodings = face_recognition.face_encodings(unknown_image)
#     face_locations = face_recognition.face_locations(unknown_image)
#     face_names = defaultdict(list)

#     print(f"Recognizing image: {image_path}")
#     # print(f"Found {len(unknown_face_encodings)} faces in the image.")

#     for face_encoding, (top, right, bottom, left) in zip(unknown_face_encodings, face_locations):
#         matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.4)
#         name = "Unknown"
#         if True in matches:
#             matched_index = matches.index(True)
#             name = known_face_names[matched_index]

#         if name != "Unknown":  # Only print if the face is not unknown
#             face_names[name].append((top, right, bottom, left))
#             print(f"Detected face: {name}")

#     return face_names

# def process_and_recognize_faces(event_folder, username):
#     input_directory = os.path.join(os.getcwd(), 'public', 'events', event_folder)
#     user_input_directory = os.path.join(os.getcwd(), 'public', 'temp', username)
#     output_directory = os.path.join(os.getcwd(), 'public', 'user_images', username)
#     current_dir = os.getcwd()

#     os.makedirs(output_directory, exist_ok=True)

#     known_face_encodings, known_face_names = load_known_faces(user_input_directory)

#     user_images = []
#     imagesarr = []
    
#     for filename in os.listdir(input_directory):
#         image_path = os.path.join(input_directory, filename)
#         face_names = recognize_faces(image_path, known_face_encodings, known_face_names)
#         for name, locations in face_names.items():
#             if name != "Unknown":
#                 event_image_path = os.path.join(input_directory, filename)
#                 output_image_path = os.path.join(output_directory, f"{username}_{filename}")
#                 shutil.copy(event_image_path, output_image_path)
#                 user_images.append(output_image_path)
#                 imagesarr.append(image_path)


#     # Delete the temp folder after processing
#     # shutil.rmtree(user_input_directory)

#     return imagesarr

# if __name__ == '__main__':
#     event_folder = "6666cf826b3d0df0fb91eb5d" # sys.argv[1]   
#     username = "aaa"  #sys.argv[2]       

#     user_images = process_and_recognize_faces(event_folder, username)

        
#     print(json.dumps(user_images))



#############################



# import face_recognition
# import os
# import sys
# import shutil
# import json
# from collections import defaultdict
# from pymongo import MongoClient

# def preprocess_image(image_path, target_size=(224, 224)):
#     image = face_recognition.load_image_file(image_path)
#     return image

# def load_known_faces(train_directory):
#     known_face_encodings = []
#     known_face_names = []

#     for filename in os.listdir(train_directory):
#         image_path = os.path.join(train_directory, filename)
#         print(f"Processing image: {image_path}")
#         image = preprocess_image(image_path)
#         encodings = face_recognition.face_encodings(image)
#         if len(encodings) > 0:
#             encoding = encodings[0]
#             name = os.path.splitext(filename)[0]  # Remove file extension
#             known_face_encodings.append(encoding)
#             known_face_names.append(name)
#         else:
#             print(f"No faces found in {filename}. Skipping this image.")

#     return known_face_encodings, known_face_names

# def recognize_faces(image_path, known_face_encodings, known_face_names):    
#     unknown_image = preprocess_image(image_path)
#     unknown_face_encodings = face_recognition.face_encodings(unknown_image)
#     face_locations = face_recognition.face_locations(unknown_image)
#     face_names = defaultdict(list)

#     print(f"Processing image: {image_path}")
#     print(f"Found {len(unknown_face_encodings)} faces in the image.")

#     for face_encoding, (top, right, bottom, left) in zip(unknown_face_encodings, face_locations):
#         matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.4)
#         name = "Unknown"
#         if True in matches:
#             matched_index = matches.index(True)
#             name = known_face_names[matched_index]

#         if name != "Unknown":  # Only print if the face is not unknown
#             face_names[name].append((top, right, bottom, left))
#             print(f"Detected face: {name}")

#     return face_names

# def process_and_recognize_faces(event_folder, username):
#     input_directory = os.path.join(os.getcwd(), 'public', 'events', event_folder)
#     user_input_directory = os.path.join(os.getcwd(), 'public', 'temp', username)
#     output_directory = os.path.join(os.getcwd(), 'public', 'user_images', username)
#     current_dir = os.getcwd()

#     os.makedirs(output_directory, exist_ok=True)

#     known_face_encodings, known_face_names = load_known_faces(user_input_directory)

#     user_images = []
#     imagesarr = []
    
#     for filename in os.listdir(input_directory):
#         image_path = os.path.join(input_directory, filename)
#         face_names = recognize_faces(image_path, known_face_encodings, known_face_names)
#         for name, locations in face_names.items():
#             if name != "Unknown":
#                 event_image_path = os.path.join(input_directory, filename)
#                 output_image_path = os.path.join(output_directory, f"{username}_{filename}")
#                 shutil.copy(event_image_path, output_image_path)
#                 user_images.append(output_image_path)
#                 imagesarr.append(image_path)


#     # Delete the temp folder after processing
#     # shutil.rmtree(user_input_directory)

#     return imagesarr

# if __name__ == '__main__':
#     event_folder =  sys.argv[1]    #"665ff422721d56e3541fbf8e"
#     username =  sys.argv[2]        #"Mithil"

# # if __name__ == '__main__':
# #     event_folder = "6666cf826b3d0df0fb91eb5d"     #sys.argv[1]
# #     username = "Mithil"           #sys.argv[2]

#     user_images = process_and_recognize_faces(event_folder, username)
#     print(json.dumps(user_images))



##################


# # backend
# import face_recognition
# import os
# import sys
# import shutil
# from collections import defaultdict
# from pymongo import MongoClient

# def preprocess_image(image_path, target_size=(224, 224)):
#     image = face_recognition.load_image_file(image_path)
#     return image

# def load_known_faces(train_directory):
#     known_face_encodings = []
#     known_face_names = []

#     for filename in os.listdir(train_directory):
#         image_path = os.path.join(train_directory, filename)
#         # print(f"Processing image: {image_path}")
#         image = preprocess_image(image_path)
#         encodings = face_recognition.face_encodings(image)
#         if len(encodings) > 0:
#             encoding = encodings[0]
#             name = os.path.splitext(filename)[0]  # Remove file extension
#             known_face_encodings.append(encoding)
#             known_face_names.append(name)
#         # else:
#             # print(f"No faces found in {filename}. Skipping this image.")

#     return known_face_encodings, known_face_names

# def recognize_faces(image_path, known_face_encodings, known_face_names):
#     unknown_image = preprocess_image(image_path)
#     unknown_face_encodings = face_recognition.face_encodings(unknown_image)
#     face_locations = face_recognition.face_locations(unknown_image)
#     face_names = defaultdict(list)

#     print(f"Processing image: {image_path}")
#     # print(f"Found {len(unknown_face_encodings)} faces in the image.")

#     for face_encoding, (top, right, bottom, left) in zip(unknown_face_encodings, face_locations):
#         matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.5)
#         name = "Unknown"
#         if True in matches:
#             matched_index = matches.index(True)
#             name = known_face_names[matched_index]

#         if name != "Unknown":  # Only print if the face is not unknown
#             face_names[name].append((top, right, bottom, left))
#             print(f"Detected face: {name}")

#     return face_names

# def process_and_recognize_faces(event_folder, username):
#     input_directory = os.path.join(os.getcwd(), 'public', 'events', event_folder)
#     user_input_directory = os.path.join(os.getcwd(), 'public', 'temp', username)
#     output_directory = os.path.join(os.getcwd(), 'public', 'user_images', username)
#     current_dir = os.getcwd()

#     os.makedirs(output_directory, exist_ok=True)

#     known_face_encodings, known_face_names = load_known_faces(user_input_directory)

#     user_images = []

#     for filename in os.listdir(input_directory):
#         image_path = os.path.join(input_directory, filename)
#         face_names = recognize_faces(image_path, known_face_encodings, known_face_names)
#         for name, locations in face_names.items():
#             if name != "Unknown":
#                 event_image_path = os.path.join(input_directory, filename)
#                 output_image_path = os.path.join(output_directory, f"{username}_{filename}")
#                 shutil.copy(event_image_path, output_image_path)
#                 user_images.append(output_image_path)

#     return user_images

# if __name__ == '__main__':
#     event_folder =  sys.argv[1]    #"665ff422721d56e3541fbf8e"
#     username =  sys.argv[2]        #"Mithil"

#     user_images = process_and_recognize_faces(event_folder, username)

#     # Print each user image path on a separate line
#     for image_path in user_images:
#         print(image_path)


