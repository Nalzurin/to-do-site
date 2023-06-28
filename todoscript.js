class ToDoItem{
    constructor(){

    }
}
const ToDoItemList = [];
//The following code loads the saved todo list from local machine or creates a new empty list if none are found
//Uses the IndexedDB

// Create an instance of a db object to store the open database in
let db;

// Open database; it is created if it doesn't already exist
const openRequest = window.indexedDB.open("todolist_db", 1);

// error handler signifies that the database didn't open successfully
openRequest.addEventListener("error", () =>
  console.error("Database failed to open")
);

// success handler signifies that the database opened successfully
openRequest.addEventListener("success", () => {
  console.log("Database opened successfully");

  // Store the opened database object in the db variable. This is used a lot below
  db = openRequest.result;

  // Run the displayData() function to display the notes already in the IDB
  //displayData();
});

// Set up the database tables if this has not already been done
openRequest.addEventListener("upgradeneeded", (e) => {
  // Grab a reference to the opened database
  db = e.target.result;

  // Create an objectStore in our database to store notes and an auto-incrementing key
  // An objectStore is similar to a 'table' in a relational database
  const objectStore = db.createObjectStore("todolist_os", {
    keyPath: "id",
    autoIncrement: true,
  });

  // Define what data items the objectStore will contain
  objectStore.createIndex("title", "title", { unique: false });
  objectStore.createIndex("description", "description", { unique: false });

  console.log("Database setup complete");
});

