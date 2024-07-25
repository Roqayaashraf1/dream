export class APIFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  paginate() {
    let page = this.queryString.page * 1 || 1;
    if (page <= 0) page = 1; // Corrected from req.query.page to page
    let skip = (page - 1) * 5;
    this.page = page;
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(5); // Assign back to mongooseQuery
    return this;
  }

  filter() {
    let filterObj = { ...this.queryString };
    let excludedQuery = ["page", "sort", "fields", "keyword"];
    excludedQuery.forEach((q) => {
      delete filterObj[q];
    });
    filterObj = JSON.stringify(filterObj); // Corrected json.stringfy to JSON.stringify
    filterObj = filterObj.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );
    filterObj = JSON.parse(filterObj); // Corrected json.parse to JSON.parse
    this.mongooseQuery = this.mongooseQuery.find(filterObj); // Assign back to mongooseQuery
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      let sortedBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortedBy); // Assign back to mongooseQuery
    }
    return this;
  }

  search() {
    if (this.queryString.keyword) {
      this.mongooseQuery = this.mongooseQuery.find({
        $or: [
          { title: { $regex: this.queryString.keyword, $options: "i" } },
          { description: { $regex: this.queryString.keyword, $options: "i" } },
        ],
      });
    }
    return this;
  }

  selectedFields() {
    if (this.queryString.fields) {
      let fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields); // Assign back to mongooseQuery
    }
    return this; // Return the APIFeatures instance for chaining
  }
}
