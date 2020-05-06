import json
import time

from collections import deque

# Channel list class
class ChannelList:
    def __init__(self):
        self.channels = []

    def get_channels_list(self):
        channels_list = []
        for channel in self.channels:
            channels_list.append(channel.get_name())
        return channels_list
    
    def get_channel(self, name):
        for channel in self.channels:
            if channel.get_name() == name:
                return channel

# Channel class
class Channel:
    def __init__(self, name):
        self.name = name
        self.messages = deque(maxlen=100)
    
    def get_name(self):
        return self.name

    def add_message(self, msg):
        self.messages.append(msg)

    def get_messages(self):
        captions = ['Text', 'User', 'Time']
        prepared = [dict(zip(captions, message.toArray())) for message in self.messages]
        j = json.dumps(prepared)
        return j

# Message class
class Message:
    def __init__(self, text, user):
        self.text = text
        self.user = user
        self.timestamp = time.time()

    def toArray(self):
        return [self.text, self.user, self.timestamp]