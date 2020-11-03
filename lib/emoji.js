const emojis = [
  '🌳', '🌲', '🍂', '🍃',
];


function getEmoji() {
  const index = Math.floor(Math.random() * emojis.length);

  return emojis[index];
}

module.exports = {
  getEmoji
};
