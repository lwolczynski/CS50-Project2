import os
import requests

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit
from .models import *

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Object storing all channels and messages
db_data = ChannelList()

# Render homepage/login page
@app.route("/")
def index():
    return render_template("index.html")

# Render application page 
@app.route("/flack", methods=["GET", "POST"])
def flack():
    return render_template("flack.html")

# User adds channel
@socketio.on("add channel")
def add_channel(data):
    newChannelName = data["newChannelName"]
    if newChannelName not in db_data.get_channels_list():
        # Add channel to the db
        db_data.channels.append(Channel(newChannelName))
        # Respond with broadcast message containing new channel name
        emit("channel added", newChannelName, broadcast=True)

# User sends message
@socketio.on("send message")
def message_sent(data):
    channel = data["channelName"]
    message = data["message"]
    user = data["user"]
    msg = Message(message, user)
    # Add message to the db
    db_data.get_channel(channel).add_message(msg)
    # Respond with broadcast message containing name of the channel where message was added
    emit("channel update", channel, broadcast=True)

# User asks for channels list
@socketio.on("fetch channels")
def read_channels():
    # Respond with unicast message containing the list of channels
    emit("channels list", db_data.get_channels_list(), broadcast=False)

# User asks for channel messages
@socketio.on("fetch messages")
def fetch_messages(data):
    channel = data["channelName"]
    # Respond with unicast message containing the list of channel messages
    emit("messages", db_data.get_channel(channel).get_messages(), broadcast=False)

# Run script
if __name__ == "__main__":
    socketio.run(app)