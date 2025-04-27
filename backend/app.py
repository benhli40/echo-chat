from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connected_clients = {}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    username = None
    print(f"🔵 New client connected.")

    try:
        while True:
            data = await websocket.receive_text()
            data_json = json.loads(data)

            if data_json.get("type") == "join":
                username = data_json.get("username")
                connected_clients[websocket] = username
                await broadcast_system_message(f"{username} joined the chat.")
            elif data_json.get("type") == "chat":
                await broadcast(json.dumps({
                    "type": "chat",
                    "username": data_json["username"],
                    "message": data_json["message"],
                    "id": data_json["id"]
                }))
            elif data_json.get("type") == "edit":
                await broadcast(json.dumps({
                    "type": "edit",
                    "id": data_json["id"],
                    "newMessage": data_json["newMessage"]
                }))
            elif data_json.get("type") == "file":
                await broadcast(json.dumps({
                    "type": "file",
                    "username": data_json["username"],
                    "filename": data_json["filename"],
                    "filedata": data_json["filedata"],
                    "filetype": data_json["filetype"]
                }))

    except WebSocketDisconnect:
        if websocket in connected_clients:
            left_username = connected_clients[websocket]
            del connected_clients[websocket]
            await broadcast_system_message(f"{left_username} left the chat.")
            print(f"🔴 {left_username} disconnected.")
    except Exception as e:
        print(f"⚠️ Connection error: {e}")
        if websocket in connected_clients:
            del connected_clients[websocket]

async def broadcast(message: str):
    for client in connected_clients.keys():
        await client.send_text(message)

async def broadcast_system_message(text: str):
    system_message = {
        "type": "system",
        "message": text
    }
    await broadcast(json.dumps(system_message))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
