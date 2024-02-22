function generateRandomIntegers(count, min, max) {
    const randomIntegers = [];
  
    for (let i = 0; i < count; i++) {
      const randomInteger = Math.floor(Math.random() * (max - min + 1)) + min;
      randomIntegers.push(randomInteger);
    }
  
    return randomIntegers;
  }
  

  module.exports = generateRandomIntegers