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
  displayData();
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

// Define the addData() function
function addData(e) {
  // prevent default - we don't want the form to submit in the conventional way

  e.preventDefault();

  document.getElementById("addoverlay").style.display = "none";
  // grab the values entered into the form fields and store them in an object ready for being inserted into the DB
  const newItem = { title: titleInput.value, description: descInput.value };

  // open a read/write db transaction, ready for adding the data
  const transaction = db.transaction(["todolist_os"], "readwrite");

  // call an object store that's already been added to the database
  const objectStore = transaction.objectStore("todolist_os");

  // Make a request to add our newItem object to the object store
  const addRequest = objectStore.add(newItem);

  addRequest.addEventListener("success", () => {
    // Clear the form, ready for adding the next entry
    titleInput.value = "";
    descInput.value = "";
  });

  // Report on the success of the transaction completing, when everything is done
  transaction.addEventListener("complete", () => {
    console.log("Transaction completed: database modification finished.");

    // update the display of data to show the newly added item, by running displayData() again.
    displayData();
  });

  transaction.addEventListener("error", () =>
    console.log("Transaction not opened due to error")
  );
}

const list = document.getElementById("notelist")
// Define the displayData() function
function displayData() {
  // Here we empty the contents of the list element each time the display is updated
  // If you didn't do this, you'd get duplicates listed each time a new note is added
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  // Open our object store and then get a cursor - which iterates through all the
  // different data items in the store
  const objectStore = db.transaction("todolist_os").objectStore("todolist_os");
  objectStore.openCursor().addEventListener("success", (e) => {
    // Get a reference to the cursor
    const cursor = e.target.result;

    // If there is still another data item to iterate through, keep running this code
    if (cursor) {
      // Create a list item, h3, and p to put each data item inside when displaying it
      // structure the HTML fragment, and append it inside the list
      const listItem = document.createElement("div");
      const descFolder = document.createElement("div");
      const h3 = document.createElement("h3");
      const desc = document.createElement("p");

      // Create a button and place it inside each listItem
      const deleteBtn = document.createElement("button");
      deleteBtn.setAttribute("class","delBtn fa-solid fa-trash fa-3x");
      deleteBtn.setAttribute("style","color: #ffffff;");


      listItem.appendChild(h3);
      listItem.appendChild(deleteBtn);
      listItem.appendChild(descFolder);

      descFolder.appendChild(desc);
      list.appendChild(listItem);

      // Put the data from the cursor inside the h3 and desc
      h3.textContent = cursor.value.title;
      desc.textContent = cursor.value.description;

      // Store the ID of the data item inside an attribute on the listItem, so we know
      // which item it corresponds to. This will be useful later when we want to delete items
      listItem.setAttribute("data-note-id", cursor.value.id);
      listItem.setAttribute("class", "listitem");

      listItem.setAttribute("onclick", "DescWindowToggle("+cursor.value.id+")");
      descFolder.setAttribute("class", "descfolder");

      h3.setAttribute("class", "noteItemTitle")

      // Set an event handler so that when the button is clicked, the deleteItem()
      // function is run
      deleteBtn.addEventListener("click", deleteItem);
      
      // Iterate to the next item in the cursor
      cursor.continue();
    } else {
      // Again, if list item is empty, display a 'No notes stored' message
      if (!list.firstChild) {
        const listItem = document.createElement("div");
        listItem.textContent = "Create a new To Do note";
        list.appendChild(listItem);
      }
      // if there are no more cursor items to iterate through, say so
      console.log("Notes all displayed");
    }
  });
}

// Define the deleteItem() function
function deleteItem(e) {
  // retrieve the name of the task we want to delete. We need
  // to convert it to a number before trying to use it with IDB; IDB key
  // values are type-sensitive.
  const noteId = Number(e.target.parentNode.getAttribute("data-note-id"));

  // open a database transaction and delete the task, finding it using the id we retrieved above
  const transaction = db.transaction(["todolist_os"], "readwrite");
  const objectStore = transaction.objectStore("todolist_os");
  const deleteRequest = objectStore.delete(noteId);

  // report that the data item has been deleted
  transaction.addEventListener("complete", () => {
    // delete the parent of the button
    // which is the list item, so it is no longer displayed
    e.target.parentNode.parentNode.removeChild(e.target.parentNode);
    console.log(`Note ${noteId} deleted.`);

    // Again, if list item is empty, display a 'No notes stored' message
    if (!list.firstChild) {
      const listItem = document.createElement("div");
      listItem.textContent = "Create a new To Do note";
      list.appendChild(listItem);
    }
  });
}
const form = document.getElementById("AddForm");
const titleInput = document.getElementById("titleInput");
const descInput = document.getElementById("descInput");
form.addEventListener("submit", addData);

