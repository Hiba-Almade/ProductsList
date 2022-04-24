class Helper {
  //This db variable was used in order not to repeat "builfire.datastore" many times in our code
  static get db() {
    return buildfire.datastore;
  }

  static get Collections() {
    return {
      PRODUCTS: "Products",
      INTRODUCTION: "Introduction4",
      LANGUAGE: "$bfLanguageSettings_",
    };
  }
}
