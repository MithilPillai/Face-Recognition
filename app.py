import sys
import json

def recognize_faces(event_id, username):
    # Your face recognition code here
    # For demonstration purposes, we'll return a mock result
    return {
        username: [
            {"filename": f"{username}_1.jpg", "path": f"/path/to/{username}_1.jpg"},
            {"filename": f"{username}_2.jpg", "path": f"/path/to/{username}_2.jpg"}
        ]
    }

if __name__ == "__main__":
    event_id = sys.argv[1]
    username = sys.argv[2]

    results = recognize_faces(event_id, username)
    print(json.dumps(results))
