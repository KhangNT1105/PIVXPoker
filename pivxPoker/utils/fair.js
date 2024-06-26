const crypto = require('crypto');
var _ = require('lodash');

module.exports.generateServerSeed = () => crypto.randomBytes(256).toString('hex');
module.exports.sha256 = (seed) => {
  return crypto.createHash('sha256').update(seed).digest('hex');
};

module.exports.sha512 = (string) => crypto.createHash('sha512').update(string).digest('hex');
function* byteGenerator({ serverSeed, clientSeed, nonce, cursor }) {
  // Setup curser variables
  let currentRound = Math.floor(cursor / 32);
  let currentRoundCursor = cursor;
  currentRoundCursor -= currentRound * 32;
  // console.log("in byteGenerator");
  // Generate outputs until cursor requirement fulfilled
  while (true) {
    // HMAC function used to output provided inputs into bytes
    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(`${clientSeed}:${nonce}:${currentRound}`);
    const buffer = hmac.digest();
    // console.log(`${clientSeed}:${nonce}:${currentRound}`);
    // Update curser for next iteration of loop
    // console.log(buffer);
    while (currentRoundCursor < 32) {
      yield Number(buffer[currentRoundCursor]);
      currentRoundCursor += 1;
    }
    currentRoundCursor = 0;
    currentRound += 1;
  }
}
const generateFloats = ({ serverSeed, clientSeed, nonce, cursor, count }) => {
  // Random number generator function
  const rng = byteGenerator({ serverSeed, clientSeed, nonce, cursor });
  // Declare bytes as empty array
  const bytes = [];

  // Populate bytes array with sets of 4 from RNG output
  while (bytes.length < count * 4) {
    bytes.push(rng.next().value);
  }

  // Return bytes as floats using lodash reduce function
  return _.chunk(bytes, 4).map((bytesChunk) => {
    // console.log(bytesChunk);
    return bytesChunk.reduce((result, value, i) => {
      const divider = 256 ** (i + 1);
      const partialResult = value / divider;
      // console.log(result);
      return result + partialResult;
    }, 0);
  });
};
module.exports.generateFloats = (serverSeed, clientSeed, nonce, cursor, count) => {
  // Random number generator function
  const rng = byteGenerator({ serverSeed, clientSeed, nonce, cursor });
  // Declare bytes as empty array
  const bytes = [];

  // Populate bytes array with sets of 4 from RNG output
  while (bytes.length < count * 4) {
    bytes.push(rng.next().value);
  }

  // Return bytes as floats using lodash reduce function
  return _.chunk(bytes, 4).map((bytesChunk) => {
    // console.log(bytesChunk);
    return bytesChunk.reduce((result, value, i) => {
      const divider = 256 ** (i + 1);
      const partialResult = value / divider;
      // console.log(result);
      return result + partialResult;
    }, 0);
  });
};

module.exports.generateCards = (serverSeed, clientSeed, nonce, cursor, count) => {
  // Random number generator function
  const rng = generateFloats({ serverSeed, clientSeed, nonce, cursor, count });
  // Declare bytes as empty array
  const tmp_cards = [],
    cards = [];
  for (let i = 1; i <= count; i++) {
    tmp_cards.push(i);
  }
  let tmp_i = 0;
  let tmp_no;
  for (let i = 0; i < count; i++) {
    tmp_no = Math.floor(rng[tmp_i] * tmp_cards.length);
    cards.push(tmp_cards[tmp_no]);

    tmp_cards.splice(tmp_no, 1);
    tmp_i++;
  }
  return cards;
};
