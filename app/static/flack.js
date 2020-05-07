// Redirect if no name set
if (!(localStorage.hasOwnProperty('displayName'))) {
    window.location.replace(location.protocol + '//' + document.domain + ':' + location.port);
}

// Initialize var to keep current channel name
var currentChannel = '';

document.addEventListener('DOMContentLoaded', () => {

    updateNameDisplay();

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port, {transports: ['websocket']});

    // When connected
    socket.on('connect', () => {

        // Get current list of channels
        socket.emit('fetch channels');      

    });

    // When channels list received
    socket.on('channels list', channels => {
        buildChannelList(channels);
        readLastVisitedChannel(channels);
        listenToChannelPick();
    });

    // When new channel is added
    socket.on('channel added', channel => {
        addChannelToTheList(channel);
        listenToChannelPick();
    });

    // When new message on any channel
    socket.on('channel update', channel => {
        if (channel == currentChannel) {
            fetchMessages();
        } else {
            markChannelUnread(channel);
        }
    });
    
    // When messages are fetched
    socket.on('messages', messages => {
        const messageHistory = document.querySelector('#messageHistory');
        messagesArray = JSON.parse(messages);
        messageHistory.innerHTML = ''
        for (var i=0; i<messagesArray.length; i++) {
            messageHistory.innerHTML += JSONMessageToText(messagesArray[i])+'<br>'
        }
        window.scrollTo(0, document.body.scrollHeight);
    });

    // Add a channel when button clicked
    document.querySelector('#createNewChannel').onsubmit = function() {
        const newChannelName = document.querySelector('#newChannelName');
        socket.emit('add channel', {'newChannelName': newChannelName.value});
        newChannelName.value = '';
        return false;
    }

    // Send a message when button clicked
    document.querySelector('#sendNewMessage').onsubmit = function() {
        const message = document.querySelector('#newMessage');
        socket.emit('send message', {'channelName': currentChannel, 'message': message.value, 'user': localStorage.getItem('displayName')});
        message.value = '';
        return false;
    }  

    // Sign out when button clicked
    document.querySelector('#signOutLink').onclick = function() {
        localStorage.removeItem('displayName');
        localStorage.removeItem('currentChannel');
        window.location.replace(location.protocol + '//' + document.domain + ':' + location.port);
    }

    // Show/hide sidebar when button clicked
    document.querySelector('#showSidebar').onclick = function() {
        const sidebar = document.querySelector('#sidebar');
        if (sidebar.classList.contains('d-none')) {
            sidebar.classList.remove('d-none');
        } else {
            sidebar.classList.add('d-none');
        }
    }

    // Read name from local storage and display it
    function updateNameDisplay() {
        const nameDisplayField = document.querySelector('#nameDisplayField');
        nameDisplayField.innerHTML = 'Logged in as '+localStorage.getItem('displayName');
    }

    // Read name from variable and display it
    function updateChannelDisplay() {
        const channelDisplayField = document.querySelector('#channelDisplayField');
        channelDisplayField.innerHTML = 'Current channel: '+currentChannel;
    }

    // Build channels list from scratch
    function buildChannelList(channels) {
        const ul = document.querySelector('#channelList');
        ul.innerHTML = '';
        for (var i=0; i<channels.length; i++) {
            addChannelToTheList(channels[i])
        }
    }

    // Add single channel to the list
    function addChannelToTheList(channel) {
        const ul = document.querySelector('#channelList');
        var li = document.createElement('li');
        var a = document.createElement('a');
        li.className = 'nav-item';
        a.className = 'nav-link px-0 p-2';
        a.dataset.name = channel;
        a.href = '#';
        a.innerHTML = channel;
        ul.appendChild(li);
        li.appendChild(a);
    }    

    // Display channel as unread
    function markChannelUnread(channel) {
        const a = document.querySelector("#channelList").querySelector(`a[data-name="${channel}"]`);
        a.style.fontWeight = 'bold';
    }

    // Display channel as read
    function markChannelRead() {
        const a = document.querySelector("#channelList").querySelector(`a[data-name="${currentChannel}"]`);
        a.style.fontWeight = 'normal';
    }

    // Update channel query selector after DOM modification
    function listenToChannelPick() {
        document.querySelector("#channelList").querySelectorAll('li > a').forEach(a => {
            a.onclick = () => {
                setCurrentChannel(a.dataset.name);
                socket.emit('switch channel', {'channelName': currentChannel});
                updateChannelDisplay();
                markChannelRead();
                fetchMessages();
                document.querySelector("#newMessageBtn").disabled = false;
            };
        });
    }

    // Translate message from JSON to string
    function JSONMessageToText(msg) {
        const ts = new Date(msg.Time*1000).toLocaleString().replace(',', '');
        return `${msg.User} @ ${ts}: ${msg.Text}`
    }

    // Fetch messages
    function fetchMessages() {
        socket.emit('fetch messages', {'channelName': currentChannel});
    }

    // Write current channel name to variable and local storage
    function setCurrentChannel(channel) {
        currentChannel = channel;
        localStorage.setItem('currentChannel', currentChannel);
    }    

    // Read current channel from local storage and set it to local variable
    // Use when user reopens app
    function readLastVisitedChannel(channels) {
        if (localStorage.hasOwnProperty('currentChannel')) {
            readFromLocalStorage = localStorage.getItem('currentChannel');
            if (channels.includes(readFromLocalStorage)) {
                currentChannel = readFromLocalStorage;
                updateChannelDisplay();
                fetchMessages();
                document.querySelector("#newMessageBtn").disabled = false;
            } else {
                localStorage.removeItem('currentChannel');
            }
        }
    }

});
