const express = require("express");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sachin:Sachin@123@cluster0.9wihp.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true})

const itemSchema = {
  name: {
    type: String,
    required: true
  }
};

const Item = mongoose.model("item", itemSchema);

const item1 = new Item({
  name: "Welcome to your To Do List"
});

const item2 = new Item({
  name: "Press + button to add the items"
});

const item3 = new Item({
  name: "<-- Hit this button to delete the item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("list", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(error, foundItems) {
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(error) {
        if(error){
          console.log(error);
        }
      })
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});

app.get("/:customListName", function(req, res) {
  
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(error, foundedList) {
    if(!error){
      if(!foundedList) {
        // Create a new list!
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        // Show the existig list!
        res.render("list", {listTitle: foundedList.name, newListItems: foundedList.items})
      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const addItem = new Item({
    name: itemName
  });

  if(listName === "Today"){
    addItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(error, foundedList) {
      foundedList.items.push(addItem);
      foundedList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req, res) {
  
  const checkedItemId =  req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "Today") {
    Item.findByIdAndRemove(checkedItemId, function(error) {
      if(error){
        console.log(error);
      }
      else{
        res.redirect("/");
      }
    })
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(error, foundedList) {
      if(!error){
        res.redirect("/" + listName);
      }
    });
  }
})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started succesfully");
});
