// Redirect if name already set
if (localStorage.hasOwnProperty("displayName")) {
    window.location.replace(location.protocol + '//' + document.domain + ':' + location.port + '/flack');
}

//If name not set build DOM
document.addEventListener('DOMContentLoaded', () => {
    var body = document.querySelector('body');
    var div1 = document.createElement('div');
    var div2 = document.createElement('div');
    var form = document.createElement('form');
    var h1 = document.createElement('h1');
    var input = document.createElement('input');
    var button = document.createElement('button');
    var p = document.createElement('p');
    div1.className = 'row h-100';
    div2.className = 'col-sm-12 my-auto';
    form.className = 'form-signin';
    form.id = 'setDisplayName';
    h1.className = 'h3 mb-3 font-weight-normal';
    h1.innerHTML = 'Please pick your name';
    input.className = 'form-control';
    input.id = 'displayName';
    input.maxLength = 30;
    input.required = true;
    input.autofocus = true;
    input.placeholder = 'Your name';
    button.className = 'btn btn-lg btn-primary btn-block';
    button.type = 'submit';
    button.innerHTML = 'Sign in';
    p.className = 'mt-5 mb-3 text-muted';
    p.innerHTML = 'CS50 Project 2: Flack';
    body.appendChild(div1);
    div1.appendChild(div2);
    div2.appendChild(form);
    form.appendChild(h1);
    form.appendChild(input);
    form.appendChild(button);
    form.appendChild(p);

    //Actions to take after sign in button hit
    document.querySelector('#setDisplayName').onsubmit = function() {
        const displayName = document.querySelector('#displayName').value;
        localStorage.setItem('displayName', displayName);
        window.location.replace(location.protocol + '//' + document.domain + ':' + location.port + '/flack');
    }

});
