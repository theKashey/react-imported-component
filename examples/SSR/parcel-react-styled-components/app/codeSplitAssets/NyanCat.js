export default () => {
  const stars = document.querySelectorAll('.stars')[0];
  for (let i = 0; i < 12; i += 1) {
    stars.innerHTML += '<div class="star"><span></span></div>';
  };
}