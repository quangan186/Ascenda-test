var fs = require("fs");

const getData = async () => {
  try {
    const response = await fetch('https://61c3deadf1af4a0017d990e7.mockapi.io/offers/near_by?lat=1.313492&lon=103.860359&rad=20');
    const data = await response.json();
    fs.writeFileSync('./input.json', JSON.stringify(data), 'utf-8');
    return data;
  } catch (err) {
    console.error(err);
    throw err; // Rethrow the error to handle it in the calling function
  }
}

const readline = require("node:readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const isValidDateFormat = (input) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/; // Regex for YYYY-MM-DD format
  return regex.test(input);
};

const checkDateIsValid = (inputDate, date) => {
    const inputDateObj = new Date(inputDate);
    const dateObj = new Date(date);
    return dateObj.getTime() - inputDateObj.getTime() >= 0;
}

const getFilteredOffers = (offers, inputDate) => {
  let uniqueCategories = new Set();
  return offers.filter(offer => {
    const isUniqueCategory = !uniqueCategories.has(offer.category);
    const isCategoryNotThree = offer.category !== 3;
    const isValidDate = checkDateIsValid(inputDate, offer.valid_to);

    if (isUniqueCategory && isCategoryNotThree && isValidDate) {
      uniqueCategories.add(offer.category);
      return true;
    }
    return false;
  });
}

const chooseClosestMerchant = (offer) => {
  if (offer.merchants.length <= 1){
    return
  }
  return offer.merchants = [...offer.merchants.sort((a, b) => {
    return a.distance - b.distance
  }).slice(0, 1)]
}

const sortByDate = (offers) => {
  return offers.sort((a, b) => {
    return new Date(a.valid_to) - new Date(b.valid_to);
  })
}
async function main() {
  readline.question("Choose your check-in date (YYYY-MM-DD): ", async (date) => {
    if (!isValidDateFormat(date)) {
      console.log("Invalid date. Please try again.");
      main(); 
      return;
    }
    try {
        await getData()
        const data = fs.readFileSync("./input.json", "utf-8");
        const offers = JSON.parse(data).offers;
        const filteredOffers = getFilteredOffers(offers, date);

        const twoClosestOffer = sortByDate(filteredOffers).slice(0, 2)
        twoClosestOffer.forEach(offer => chooseClosestMerchant(offer))
        const outputJSONContent = {
          offers: twoClosestOffer.sort((a, b) => a.id - b.id)
        }
        console.log(outputJSONContent)
        fs.writeFileSync('./output.json', JSON.stringify(outputJSONContent), 'utf-8')
    } catch (err) {
        console.error(err);
    }
    // .forEach(offer => chooseClosetMerchant(offer))
    readline.close();
    process.exit();
  });
}

main();
