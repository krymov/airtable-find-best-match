class Closest {
  /**
   * Creates an instance of Closest.
   * @param {Array}     list    Elements of reference can be an Array of Numbers
   *                            or Array's with an equal length
   * @param {Boolean}   unique  If set to true, every entry from `list`
   *                            can be returned only once
   *                            unit clearCache() is called
   */
  constructor(list, unique) {
    // creates a copy of list
    this.list = Array.from(list);

    this.dimensions = Closest.getDimensions(list[0]);

    this.unique = unique;

    // sets the adequate diff method based on the depth of the vectors
    this.diff = this.dimensions > 1 ? Closest.nDimensionalDiff(this.dimensions)
                : Closest.oneDimensionalDiff;
    // console.log(this.diff)
    // inits the cache and previouslyReturnedIndexes properties
    this.clearCache(false);
  }

  /**
   * determines if the items in the list are simple numbers or arrays
   * @static
   * @param     {Number|Array} item
   * @return    {Number}       number of dimensions (1 being a simple number,
   *                           everything above is an array)
   */
  static getDimensions(item) {
    return typeof item == 'number' ? 1 : item.length;
  }

  /**
   * diff function for simple numbers
   * @static
   * @param     {Number} val1
   * @param     {Number} val2
   * @return    {Number} Abstract difference between two numbers
   */
  static oneDimensionalDiff(val1, val2) {
    return Math.abs(val1-val2);
  }

  /**
   * diff function for array's of N numbers
   * @static
   * @param     {Number} dimensions number of dimensions of your vector
   * @return    {Function} returns the adequate diff function
   *                       Euclidean distance
   *                       (https://en.wikipedia.org/wiki/Euclidean_distance)
   */
  static nDimensionalDiff(dimensions) {
    if (dimensions == 2) {
      return (val1, val2) => (
        (val1[0] - val2[0]) * (val1[0] - val2[0]) +
        (val1[1] - val2[1]) * (val1[1] - val2[1])
      );
    } else if (dimensions == 3) {
      return (val1, val2) => (
        (val1[0] - val2[0]) * (val1[0] - val2[0]) +
        (val1[1] - val2[1]) * (val1[1] - val2[1]) +
        (val1[2] - val2[2]) * (val1[2] - val2[2])
      );
    } else {
      // elegant but slow solution
      return (val1, val2) => (
        val1.reduce(
            (acc, val, i) => ((val - val2[i]) * (val - val2[i]) + acc)
            , 0)
      );
    }
  }

  /**
   Public method to rest cached value / result paris
   * especially if set to unique (return every match only once)
   * you may want to reset the previously returned indexes
   * @param {Boolean} indexOnly if you are using "unique" mode only the returned
   *                            indexes are cleared by default
   */
  clearCache(indexOnly = this.unique) {
    if (!indexOnly) {
      this.cache = {};
    }
    this.previouslyReturnedIndexes = [];
  }

  /**
   * gets the closes Number/VectorN
   * @param {Number|Array} val reference number or array
   * @return {Object|Null} closes match within lists containing
   *                      {
   *                         closest:   {Number|Array} closest entry from list
   *                         index:     {Number}       index within list
   *                         distance:  {Number}       Distance within the
   *                                                   coordinate system
   *                      }
   */
  get(val) {
    let minDistance = Infinity;
    let index = 0;
    let closest = this.list[index];

    // is there a better way to do this? If "val" is only a number, it seams
    // like a big overhead to JSON stringify it every-time, I don't see an other
    // way when val is an array thought. Other than something like
    // cache[val[0]][val[1]][val[3]] or whatever
    const valUID = JSON.stringify(val);

    // returns previously found match
    if (!this.unique && this.cache.hasOwnProperty(valUID)) {
      return this.cache[valUID];
    }

    // if set to return every value in the list only once
    // and being out of entries in the list
    if (
      this.unique && this.previouslyReturnedIndexes.length === this.list.length
    ) {
      return null;
    }

    for (let i = 0; i < this.list.length; i++) {
      // skip if set to unique and value was returned previously
      if (!(this.unique && this.previouslyReturnedIndexes.indexOf(i) > -1) ) {
        const distance = this.diff(val, this.list[i]);
        if (distance < minDistance) {
          minDistance = distance;
          index = i;
          closest = this.list[i];
        }
      }
    }

    // save previously returned indexes if set to unique mode,
    if (this.unique) {
      this.previouslyReturnedIndexes.push(index);
    }

    // return and save in cache
    return this.cache[valUID] = {closest, index};
  }
}

let tableUsers =  base.getTable("Users");
let currentRecord = await input.recordAsync('',tableUsers).catch()
let v = defineVector(currentRecord)
let userStats = Object.values(v)
// console.log(userStats);

let potentialMatches = []

let query = await tableUsers.selectRecordsAsync()
for (let record of query.records) {
    let originalID = currentRecord.id
    let recID = record.id
    if (record.id != currentRecord.id) {
        potentialMatches.push(record)
    }
}

// console.log(potentialMatches)

let potentialMatchesVectors = []

for (let match of potentialMatches) {
    let stats = Object.values(defineVector(match))
    potentialMatchesVectors.push(stats)
}

// console.log(potentialMatchesVectors)
const closest = new Closest(potentialMatchesVectors, true);
let res = closest.get(userStats)
// console.log("RES", res.index)
// console.log(potentialMatches[res.index].id)

await tableUsers.updateRecordAsync(currentRecord.id, {
    "Best Match": [potentialMatches[res.index]]
})

function defineVector (record) {
    const vector ={
    clean: record.getCellValue("Clean"),
    communication: record.getCellValue("Communication"),
    noise: record.getCellValue("Noise"),
    social: record.getCellValue("Social"),
    fairness: record.getCellValue("Fairness"),
    boundaries: record.getCellValue("Boundaries")
    }
    return vector
}
