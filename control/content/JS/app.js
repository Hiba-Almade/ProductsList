let editedProduct = null;
let searchTableHelper;
let timer;

const thumbnail = new buildfire.components.images.thumbnail(
  ".thumbnail-picker", {
    title: " ",
    dimensionsLabel: "600x600px",
    multiSelection: false,
  }
);
const thumbnail2 = new buildfire.components.images.thumbnail(
  ".thumbnail-picker2", {
    title: " ",
    dimensionsLabel: "1200x675px",
    multiSelection: false,
  }
);

function init() {
  searchTableHelper = new SearchTableHelper(
    "searchResults",
    "records",
    searchTableConfig,
    "emptyState",
    "noDataSearch",
    "loading"
  );
  this.setupHandlers();
  this.initTinymce();
  searchTableHelper.search();
}

init();
var profileImage = "";
var coverImage = "";

function setupHandlers() {
  let t = this;

  thumbnail.onChange = (imageUrl) => {
    itemSaveBtn.disabled = checkSaveDisable();
    if (t.profileImage != imageUrl) {
      t.profileImage = buildfire.imageLib.cropImage(
        imageUrl, {
          size: "full_width",
          aspect: "1:1"
        }
      );
      thumbnail.loadbackground(t.profileImage);
      buildfire.messaging.sendMessageToWidget({
        id: 1,
        data : t.profileImage,
      });
    }


  };
  thumbnail2.onChange = (imageUrl) => {
    itemSaveBtn.disabled = checkSaveDisable();
    if (t.coverImage != imageUrl) {
      t.coverImage = buildfire.imageLib.cropImage(
        imageUrl, {
          size: "full_width",
          aspect: "16:9"
        }
      );
      thumbnail2.loadbackground(t.coverImage);
      buildfire.messaging.sendMessageToWidget({
        id: 2,
        data : t.coverImage,
      });
    }
  };

  thumbnail.onDelete = (imageUrl) => {
    itemSaveBtn.disabled = true;
    buildfire.messaging.sendMessageToWidget({
      id: 1,
      data:""
    });
  };
  thumbnail2.onDelete = (imageUrl) => {
    itemSaveBtn.disabled = true;
    buildfire.messaging.sendMessageToWidget({
      id: 2,
      data:""
    });
    
  };
  let timer;

  itemTitle.addEventListener("keyup", function (event) {
    itemSaveBtn.disabled = checkSaveDisable();

    clearTimeout(timer);
    timer = setTimeout(()=>{
      buildfire.messaging.sendMessageToWidget({
        id: 3,
        data: itemTitle.value,
      });
    }, 500)
  });
  searchItemText.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      searchProducts();
    }
  });
  searchTableHelper.onEditRow = (obj, tr) => {
    fillSubItem(obj);
    buildfire.messaging.sendMessageToWidget({
      openSubItemPage: true,
      itemClicked: editedProduct,
    });
  };

  buildfire.messaging.onReceivedMessage = (message) => {
    if (message.openSubItemPage) {
      fillSubItem(message.itemClicked);
    } else {
      backToMain();
    }
  };

  itemSubTitle.addEventListener("keyup", function (event) {
      clearTimeout(timer);
      timer = setTimeout(()=>{
        buildfire.messaging.sendMessageToWidget({
          id: 4,
          data: itemSubTitle.value,
        });
      }, 500)
  });
}

function fillSubItem(item) {
  thumbnail.loadbackground(item.data.profileImgUrl);
  thumbnail2.loadbackground(item.data.coverImgUrl);
  itemTitle.value = item.data.title;
  itemSubTitle.value = item.data.subTitle;
  tinymce.get("wysiwygContent").setContent(item.data.description);
  itemSaveBtn.disabled = checkSaveDisable();

  editedProduct = item;
  main.classList.add("hidden");
  subpage.classList.remove("hidden");
}

function initSubItemPage() {
  thumbnail.clear();
  thumbnail2.clear();
  itemTitle.value = "";
  itemSubTitle.value = "";
  tinymce.get("wysiwygContent").setContent("");
  itemSaveBtn.disabled = checkSaveDisable();
  main.classList.add("hidden");
  subpage.classList.remove("hidden");
}

function initTinymce() {
  tinymce.init({
    selector: "#wysiwygContent",
    setup: function (editor) {
      editor.on("keyup", function (e) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          buildfire.messaging.sendMessageToWidget({
            id: 5,
            data: tinymce.get("wysiwygContent").getContent(),
          });
        }, 500);
      });
      editor.on("change", function (e) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          buildfire.messaging.sendMessageToWidget({
            id: 5,
            data: tinymce.get("wysiwygContent").getContent(),
          });
        }, 500);
      });
    },
  });
}

function openIntroductionPage() {
  buildfire.navigation.navigateToTab({
      tabTitle: "Introduction",
      deeplinkData: {},
    },
    (err, res) => {
      if (err) return console.error(err); // `Content` tab was not found
      console.log("NAVIGATION FINISHED");
    }
  );
}

function openSubItemPage() {
  initSubItemPage();
}

function backToMain() {
  main.classList.remove("hidden");
  subpage.classList.add("hidden");
  buildfire.messaging.sendMessageToWidget({
    openSubItemPage: false,
  });
}

function generateSampleData() {
  dummyData
    .insertDummyRecords()
    .then((result) => {
      init();
    })
    .catch((err) => {
      console.error(err);
    });
}

function saveItem() {
  var $productSub;
  var isAddingProduct = false;
  if (editedProduct != null) {
    $productSub = this.updateProduct(editedProduct);
  } else {
    isAddingProduct = true;
    $productSub = this.addProduct();
  }

  $productSub
    .then(() => {
      this.init();
      this.backToMain();
      if (isAddingProduct) {
        Analytics.trackAction(Analytics.events.PRODUCT_CREATED);
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function searchProducts() {
  if (searchItemText.value == "") {
    init();
  } else {
    let filter = {
      $or: [{
          "$json.title": {
            $regex: searchItemText.value,
            $options: "-i",
          },
        },
        {
          "$json.subTitle": {
            $regex: searchItemText.value,
            $options: "-i",
          },
        },
      ],
    };
    searchTableHelper.search(filter);
  }
}

function updateProduct(product) {
  return Products.update(product.id, {
    title: itemTitle.value,
    description: tinymce.activeEditor.getContent(),
    profileImgUrl: thumbnail.imageUrl,
    coverImgUrl: thumbnail2.imageUrl,
    subTitle: itemSubTitle.value,
    creationDate: product.data.creationDate,
  });
}

function addProduct() {

  var product = new Product();
  product.title = itemTitle.value;
  product.description = tinymce.activeEditor.getContent();
  product.profileImgUrl = thumbnail.imageUrl;
  product.coverImgUrl = thumbnail2.imageUrl;
  product.subTitle = itemSubTitle.value;
  return Products.insert(product);
}

function checkSaveDisable() {
  if (
    thumbnail.imageUrl == "" ||
    thumbnail2.imageUrl == "" ||
    itemTitle.value == ""
  ) {
    return true;
  }
  return false;
}