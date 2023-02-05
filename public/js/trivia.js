const socket = io();

const urlSearchParams = new URLSearchParams(window.location.search);
const playerName = urlSearchParams.get("playerName");

const room = urlSearchParams.get("room");

const mainHeadingTemplate = document.querySelector(
  "#main-heading-template"
).innerHTML;

const welcomeHeaingHTML = Handlebars.compile(mainHeadingTemplate);

document.querySelector("main").insertAdjacentHTML(
  "afterBegin",
  welcomeHeaingHTML({
    playerName,
  })
);

socket.emit("join", { playerName, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("message", ({ playerName, text, createdAt }) => {
  const chatMessages = document.querySelector(".chat__messages");

  const messageTemplate = document.querySelector("#message-template").innerHTML;

  const template = Handlebars.compile(messageTemplate);

  const html = template({
    playerName,
    text,
    createdAt: moment(createdAt).format("h:mm a"),
  });

  chatMessages.insertAdjacentHTML("afterBegin", html);
});

socket.on("room", ({ room, players }) => {
  const gameInfo = document.querySelector(".game-info");

  const sidebarTemplate = document.querySelector(
    "#game-info-template"
  ).innerHTML;

  const template = Handlebars.compile(sidebarTemplate);

  const html = template({
    room,
    players,
  });

  gameInfo.innerHTML = html;
});

const chatForm = document.querySelector('.chat__form');

chatForm.addEventListener('submit', event => {
  event.preventDefault();

  const chatFormInput = chatForm.querySelector('.chat__message');
  const chatFormButton = chatForm.querySelector('.chat__submit-btn');

  chatFormButton.setAttribute('disabled', 'disabled');

  const message = event.target.elements.message.value;

  socket.emit('sendMessage', message, error => {
    chatFormButton.removeAttribute('disabled');
    chatFormInput.value = '';
    chatFormInput.focus();

    if (error) return alert(error);
  });
});
