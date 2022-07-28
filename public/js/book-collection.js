let selectedFile;
let rowObject = [];
let bookRowId = 0;

let urlEndpoint = "https://rai-library.herokuapp.com";
let data = [
  {
    Id: 0,
    Author: "scd",
    Name: "sdef",
    year:'0'
  },
];
intializeView();
function intializeView() {
  const tableContent = document.getElementById("tableContent");
  const no_data = document.getElementsByClassName("no-data");
  if (!!tableContent && no_data[0]) {
    getBooks().then((data) => {
      rowObject = data;
      if (!!rowObject && rowObject.length > 0) {
        document.getElementById("tableContent").style.display = "block";
        document.getElementsByClassName("no-data")[0].style.display = "none";
        document.getElementsByClassName("downloadFile")[0].style.display = "inline";
        renderTable(rowObject);
      } else {
        document.getElementsByClassName("downloadFile")[0].style.display = "none";
        document.getElementById("tableContent").style.display = "none";
        document.getElementsByClassName("no-data")[0].style.display = "flex";
      }
    });
  }
}
function selectFile(event) {
  selectedFile = event.target.files[0];
  convert();
}
function convert() {
  XLSX.utils.json_to_sheet(data, "out.xlsx");
  if (selectedFile) {
    let fileReader = new FileReader();
    fileReader.readAsBinaryString(selectedFile);
    fileReader.onload = (event) => {
      let data = event.target.result;
      let workbook = XLSX.read(data, { type: "binary" });
      workbook.SheetNames.forEach((sheet) => {
        rowObject = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheet]
        );
        postBooks(rowObject);
        !!rowObject
          ? (document.getElementsByClassName("no-data")[0].style.display =
              "none")
          : (document.getElementsByClassName("no-data")[0].style.display =
              "flex");
        !!rowObject
          ? (document.getElementById("tableContent").style.display = "block")
          : (document.getElementById("tableContent").style.display = "none");
      });
    };
  }
}
function postBooks(rowObject) {
  const bookArray = [];
  rowObject.forEach((book, index) => {
    book.Id = index + 1;
    const bookWithId = {
      Id: book.Id,
      Name: book.Name,
      Author: book.Author,
      Genre: book.Genre,
      Publisher:book.Publisher
    };
    bookArray.push(bookWithId);
  });
  fetch(`${urlEndpoint}/postbookList`, {
    method: "POST",
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
    },
    body: !!bookArray ? JSON.stringify(bookArray) : [],
  }).then((res) =>
    res.json().then((bookList) => {
      intializeView();
      renderTable(bookList);
    })
  );
}
function renderTable(rowObject) {
  document.getElementById("tableHeadRow").innerHTML = null;
  document.getElementById("tableBody").innerHTML = null;
  rowObject.length > 0 && getTableHeader(rowObject);
  rowObject.forEach((book) => {
    document.getElementById(
      "tableBody"
    ).innerHTML += `<tr><td>${book.Id}</td><td>${book.Name}</td><td>${book.Author}</td><td>${book.Genre}</td><td>${book.Publisher}<td> <i class="bi bi-trash-fill deleteManualRow" onclick="deleteBook(${book.Id})" style="float: left;"></i></td></td>`;
  });
}
function getTableHeader(rowObject) {
  const objKey = Object.keys(rowObject[0]);
  for (let key of objKey)
    document.getElementById(
      "tableHeadRow"
    ).innerHTML += `<th scope="col">${key}</th>`;
  document.getElementById(
    "tableHeadRow"
  ).innerHTML += `<th scope="col">Delete</th>`;
}
function deleteBook(bookId) {
  const findIndex = rowObject.findIndex((a) => a.Id === bookId);
  findIndex !== -1 && rowObject.splice(findIndex, 1) && postBooks(rowObject);
}
function search(event) {
  let bookList = rowObject;
  bookList = bookList.filter((data) => {
    return (
      data.Name.toString().toLowerCase().includes(event.toLowerCase()) ||
      data.Author.toString().toLowerCase().includes(event.toLowerCase()) || 
      data.Publisher.toString().toLowerCase().includes(event.toLowerCase())
    );
  });
  bookList.length > 0
    ? renderTable(bookList)
    : showMessage({ isError: true, message: "No result found.." });
}
function showMessage(result) {
 
  if(result.isError){
    document.getElementById('ërroMsg').innerHTML=result.message;
    document.getElementsByClassName('alert-danger')[0].style.display='block';
  }
}
function hideMessage(){
  document.getElementsByClassName('alert-danger')[0].style.display='none';
}
function getBooks() {
  return fetch(`${urlEndpoint}/getbookList`) //api for the get request
    .then((response) => response.json());
}
function addBookMethod() {
  bookRowId++;
  addBookField(`bookname${bookRowId}`, "Book Name", true);
  addBookField(`author${bookRowId}`, "Author", false);
  addBookField(`genre${bookRowId}`, "Genre", false);
  addBookField(`publisher${bookRowId}`, "Publisher", false);
  const modalBody = document.getElementsByClassName("modal-body")[0];
}
function addBookField(inputId, placeHolderText, isRowCountAllowed) {
  const form = document.getElementById("form_div");

  const divFormGroup = document.createElement("div");
  divFormGroup.setAttribute("class", "form-group");

  const rowCount = document.createElement("span");
  rowCount.setAttribute("class", "rowCount mt10");
  rowCount.setAttribute("name", "manuallyCreated");
  const text = document.createTextNode(`#${bookRowId + 1}`);
  rowCount.appendChild(text);

  // const deleteRow = document.createElement("i");
  // deleteRow.setAttribute("class", "bi bi-trash-fill deleteManualRow");
  // deleteRow.setAttribute("onclick", "deleteManualItem()");

  const label = document.createElement("label");
  label.setAttribute("for", "exampleInputEmail1");
  label.setAttribute("class", "mt10");
  rowCount.setAttribute("name", "manuallyCreated");
  const node = document.createTextNode(placeHolderText);
  label.appendChild(node);

  const inputOf = document.createElement("input");
  inputOf.setAttribute("id", inputId);
  inputOf.setAttribute("type", "text");
  inputOf.setAttribute("class", "form-control");
  inputOf.setAttribute("placeholder", placeHolderText);
  rowCount.setAttribute("name", "manuallyCreated");

  divFormGroup.appendChild(label);
  divFormGroup.appendChild(inputOf);

  if (isRowCountAllowed) form.appendChild(rowCount);
  // if (isRowCountAllowed) form.appendChild(deleteRow);
  form.appendChild(divFormGroup);
}
function addBookManually() {
  var params = [];
  let bookObj = { Id: "", Name: "", Author: "", Genre: "",Publisher:"" };

  for (var i = 0; i < document.addBookForm.elements.length; i++) {
    if(document.addBookForm.elements[i].value===''){
     showMessage({isError:true,message:'Please fill all the fields!'})
      return;
    }
    const id = parseInt(i) + 1;
    if (!bookObj.Name) bookObj.Name = document.addBookForm.elements[i].value;
    else if (!bookObj.Author)
      bookObj.Author = document.addBookForm.elements[i].value;
    else if (!bookObj.Genre)
      bookObj.Genre = document.addBookForm.elements[i].value;
      else if (!bookObj.Publisher)
      bookObj.Genre = document.addBookForm.elements[i].value;

    if (id % 4 === 0) {
      params.push(bookObj);
      bookObj = { Id: "", Name: "", Author: "", Genre: "",Publisher:"" };
    }
  }
  getBooks().then((data) => {
    rowObject = data;
    rowObject = [...rowObject, ...params];
    postBooks(rowObject);
  });
  $('#exampleModalLong').modal('hide')
}
function refreshAddBookUi(){
hideMessage();
document.getElementById('bookName').value='';
document.getElementById('author').value='';
document.getElementById('genre').value='';
document.getElementById('publisher').value='';
$("#form_div").empty();
}
function deleteManualItem() {
  const element=document.getElementsByClassName("form-group")[4]; 
  element.parentNode.removeChild(element);
  element.parentNode.removeChild(element);
  element.parentNode.removeChild(element);
  element.parentNode.removeChild(element);
}
function downloadFile() {
  const headers = {
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  fetch(`${urlEndpoint}/download`, { headers: headers }) //api for the get request
    .then((response) => response.json())
    .then((data) => console.log(data));
}
