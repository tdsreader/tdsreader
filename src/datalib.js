
function getData() {

  const cache = CacheService.getScriptCache();

  const getThis = ['nParts','p0'];

  const firstPartObj = cache.getAll(getThis); // get nParts and p0

  const nParts = +firstPartObj['nParts']; // from nParts we know how many parts are stored in cache

  Logger.log('nParts = ' + nParts);

  if (nParts == 1) return JSON.parse(firstPartObj['p0']); // if nParts is only one - return first part

  if (nParts > 1) { // if there are more than one part, get the rest and combine them with first

    let otherPartsNames = [];

    for (let p = 1; p < nParts; p++) {
      otherPartsNames.push('p' + p);
    }

    const otherPartsObj = cache.getAll(otherPartsNames);

    let allPartsStrings = [];

    allPartsStrings.push(firstPartObj['p0']); // first part

    for (let p = 1; p < nParts; p++) { // other parts
      const partStr = otherPartsObj['p' + p];
      allPartsStrings.push(partStr);
    }

    // now we have all the parts in an array

    return JSON.parse(allPartsStrings.join(''));

  }

  return null;

}

function cache1() {
  let cache1 = CacheService.getScriptCache();
  return cache1;
}



