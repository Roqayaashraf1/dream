export class APIFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  paginate() {
    let page = this.queryString.page * 1 || 1;
    if (page <= 0) page = 1; 
    let skip = (page - 1) * 20;
    this.page = page;
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(20); 
    return this;
  }

  filter() {
    let filterObj = { ...this.queryString };
    let excludedQuery = ["page", "sort", "fields", "keyword"];
    excludedQuery.forEach((q) => {
      delete filterObj[q];
    });
    filterObj = JSON.stringify(filterObj); 
    filterObj = filterObj.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );
    filterObj = JSON.parse(filterObj); 
    this.mongooseQuery = this.mongooseQuery.find(filterObj); 
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      let sortedBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortedBy); 
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
      this.mongooseQuery = this.mongooseQuery.select(fields);
    }
    return this;
  }
}
