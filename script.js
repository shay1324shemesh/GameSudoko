const togglePassword = document.querySelector('#togglePassword');
const username = document.querySelector('#username');
const password = document.querySelector('#password');
const usernameError = document.querySelector('#username-error');
const passwordError = document.querySelector('#password-error');
const checkbox = document.querySelector('#checkbox');

remember = window.localStorage.getItem('remember') == 'true' ? true : false;
checkbox.checked = remember;
if (!remember) window.localStorage.removeItem('username');
username.value = window.localStorage.getItem('username');
password.value = window.localStorage.getItem('password');

const boardElement = document.querySelector('body');
boardElement.addEventListener('keydown', (e) => {
  if (e.keyCode == 13) document.getElementById('btn').click();
});

togglePassword.addEventListener('click', () => {
  let isHidden = password.getAttribute('type') == 'password';
  const type = isHidden ? 'text' : 'password';
  password.setAttribute('type', type);
  const iconClass = isHidden ? 'ph-eye-slash-bold' : 'ph-eye-bold';
  togglePassword.setAttribute('class', iconClass);
});

function checkForm() {
  const usernameValue = username.value;
  const passwordValue = password.value;
  if (usernameValue == '' || passwordValue == '') {
    if (usernameValue == '') {
      usernameError.innerHTML = 'The username is empty';
      usernameError.style.display = 'block';
    }
    if (passwordValue == '') {
      passwordError.innerHTML = 'The password is empty';
      passwordError.style.display = 'block';
    }
    return;
  }

  if (passwordValue != '1234') {
    passwordError.innerHTML = 'The password is incorrect';
    passwordError.style.display = 'block';
    return;
  }

  if (checkbox.checked) {
    window.localStorage.setItem('username', usernameValue);
    window.localStorage.setItem('password', passwordValue);
    window.localStorage.setItem('remember', true);
  } else {
    window.localStorage.removeItem('password');
    window.localStorage.setItem('remember', false);
  }

  window.localStorage.setItem('username', usernameValue);
  window.location.href = './ChooseLevel.html';
}

function removeError(input) {
  if (input == 'username') usernameError.style.display = 'none';
  else passwordError.style.display = 'none';
}

function showPassword() {
  alert(`The password is: 1234`);
}
