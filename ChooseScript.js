const title = document.querySelector('#title');

title.innerHTML += ` ${window.localStorage.getItem('username')}`;
window.localStorage.removeItem('level');

function changeLevel(level) {
  window.localStorage.setItem('level', level);
  window.location.href = './Game.html';
}

function redirectLogin() {
  window.location.href = './index.html';
}
