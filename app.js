const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://<user-name>:<password>@cluster0.uhad9.mongodb.net/<YourDataBAseName>?retryWrites=true&w=majority/",{useNewUrlParser:true});
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1= new Item({
  name: "Welcome to your todolist!"
});
const item2= new Item({
  name: "Hit the + button to add new item."
});
const item3= new Item({
  name: "<---- Hit this to delete an item."
});
const defaultItems=[item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
  Item.find({},function(err, foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully added th items")
        }
      });
      res.redirect("/");
    }else{
      res.render('list', {
        listTitle: "Today",
        newListItems: foundItems
      });
    }

  })
 // let day = date.getDate();

});
app.get("/:customListName",(req, res)=>{
  const customListName=_.capitalize(req.params.customListName);

   List.findOne({name: customListName}, function(err, foundList){
     if(!err){
       if(!foundList){
         //Create A new list
         const list = new List({
           name: customListName,
           items: defaultItems
         });
         list.save();
         res.redirect("/"+customListName);
       }else{
         //show an existing list
         res.render("list",{
           listTitle: foundList.name,
           newListItems: foundList.items
         });
       }
     }
   });
});


app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
 if(listName==="Today"){
   item.save();
   res.redirect("/");
 }else{
   List.findOne({name: listName}, function(err, foundList){
     foundList.items.push(item);
     foundList.save()
     res.redirect("/"+ listName);
   })
 }


// if(req.body.list ==="Work"){
//   workItems.push(item);
//   res.redirect("/work")
// }else{
//   items.push(item);
//   res.redirect("/")
// }
//
//   items.push(item);
//   res.redirect("/");
});
app.post("/delete",(req,res)=>{
  const checkedItemId= req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully deleted checked items");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItemId}}},function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    })
  }
});

// app.get("/work",(req, res)=>{
//   res.render("list", {listTitle: "Work List", newListItems: workItems });
// });



app.get("/about",(req, res)=>{
  res.render("about");
})

app.post("/work",()=>{
  let item= req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("server is running on port 3000");
});
