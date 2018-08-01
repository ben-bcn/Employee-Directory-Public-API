const employeeNum = 12;
const nationality = 'gb';

const employeeList  = document.getElementById('employeeList');
const modal         = document.getElementById('modal');
const blackOut      = document.getElementById('blackOut');
const nav           = document.querySelectorAll('#nav li');
const closeBt       = document.getElementById('close');
const filterInput   = document.getElementById('filter');
const filterBt      = document.getElementById('filterList');
const resetBt       = document.getElementById('reset');

// ------------------------------------------
//  FETCH FUNCTIONS
// ------------------------------------------

function fetchData(url) {
  return fetch(url)
          .then(checkStatus)
          .then( res => res.json())
          .catch(error => console.log('Looks like a problem', error))
}

// used Promise so that subsequent calls could be added a later date
Promise.all([
  fetchData(`https://randomuser.me/api/?results=${employeeNum}&nat=${nationality}`),
])
.then(data => {
  // Defined as a global for use elsewhere
  peopleList = data[0].results;

  // curList is used in conjunction with the filtering
  curList = peopleList;

  // create the display of employees
  generatePeople(curList);
})

// ------------------------------------------
//  HELPER FUNCTIONS
// ------------------------------------------

function checkStatus(response){
  if(response.ok){
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
}

function generatePeople(data){
  let people = "";

  // traverse JSON object to extract detail for each person
  for(i=0; i<data.length; i++){
    people += `
      <li data-id="${i}">
      <img src ='${data[i].picture.large}'>
      <h3 class="name">${data[i].name.first} ${data[i].name.last}</h3>
      <p class="email"><a href="mailto:${data[i].email}">${data[i].email}</a></p>
      <p class="city">${data[i].location.city}</p>
      </li>
    `
  }

  // Add the HTML content to the page
  employeeList.innerHTML = people;

  // put all LI elements in the lis vairable then attached event listeners to each
  const lis = document.querySelectorAll('#employeeList li');
  addLiListeners(lis);
}

// This opens the employee detail model
function openModal(personId,data){
  const person    = data[personId]
  const name      = `${person.name.first} ${person.name.last}`;
  const email     = person.email;
  const city      = person.location.city;
  const phone     = person.phone;
  const address   = `${person.location.street}, ${person.location.state} ${person.location.postcode}`;
  const birthday  = getDate(person.dob.date);

  modal.querySelector('h3').textContent         = name;
  modal.querySelector('img').setAttribute('src',person.picture.large);
  modal.querySelector('.email a').textContent     = email;
  modal.querySelector('.email a').setAttribute('href','mailto:'+email);
  modal.querySelector('.city').textContent      = city;
  modal.querySelector('.phone').textContent     = phone;
  modal.querySelector('.address').textContent   = address;
  modal.querySelector('.birthday span').textContent  = birthday;

  const idToNum = parseInt(personId,10);
  modalNav(idToNum,data);

  // Show the modal & black-out layer behind it
  modal.style.display = 'block';
  blackOut.style.display = 'block';

}

// generates the correct next and previous nav within the modal
function modalNav(idToNum,data){
  // if we're on the first person, then hide the PREVIOUS nav
  if(idToNum < 1){
    modal.querySelector('#nav li:first-child').style.display = 'none';
  } else {
    modal.querySelector('#nav li:first-child').style.display = 'block';
  }

  // if we're on the last person, then hide the NEXT nav
  if(idToNum === (data.length-1)){
    modal.querySelector('#nav li:last-child').style.display = 'none';
  } else {
    modal.querySelector('#nav li:last-child').style.display = 'block';
  }

  modal.querySelector('#nav li:first-child').setAttribute('data-id',idToNum-1);
  modal.querySelector('#nav li:last-child').setAttribute('data-id',idToNum+1);
}

// Chanes the birtday date/time into the format required M/D/Y
function getDate(timestamp){
  const newDate = new Date(timestamp);
  return (newDate.getMonth() + 1) +"/"+newDate.getDate() + '/' +  newDate.getFullYear();
}

// ------------------------------------------
//  EVENT LISTENERS
// ------------------------------------------

// Attached event listeners to all of the LI elements in the employeeList UL
function addLiListeners(lis){
  for(i=0; i<lis.length; i++){
    lis[i].addEventListener('click',(e) => {
      const tag       = e.target.tagName;
      let personId  = '';

      // Ensure we're looking at the correct level to get the current position of the employee
      if(tag === 'LI') {
        personId  = e.target.dataset.id;
      } else if(tag === 'A') {
        personId  = e.target.parentElement.parentElement.dataset.id;
      } else  {
        personId  = e.target.parentElement.dataset.id;
      }
      // Navigate to the next employee
      openModal(personId,curList);
    });
  }
}

// Attaching event listeners to the next and previous nav items
for(i=0; i<nav.length; i++){
  nav[i].addEventListener('click', (e) => {
    openModal(e.target.dataset.id,curList);
  });
}

// Behaviour to close the modal once the X is clicked
closeBt.addEventListener('click',(e) => {
  modal.style.display = 'none';
  blackOut.style.display = 'none';
})

// Get the value from the filter field & filter the list
filterBt.addEventListener('click',(e) => {
  e.preventDefault();

  // get value in filter field
  const filterVal = filterInput.value.trim();

  // Ensure we have some value to filter by
  if(filterVal){
    // create a new array of employees based on the filtering
    const filteredList = peopleList.filter( person => {

      const first = person.name.first;
      const last  = person.name.last;

      // Add the person to the array if their first or last name contains a match
      if(first.indexOf(filterVal) >= 0 || last.indexOf(filterVal) >= 0){
        return person;
      }
    });
    // Switch the new array into the curList & generate the display
    curList = filteredList;
    generatePeople(curList);
    resetBt.style.display = 'inline-block';
  }
});

// Reset button behaviour
resetBt.addEventListener('click', (e) => {
  e.preventDefault();

  curList = peopleList;
  generatePeople(curList);
  resetBt.style.display = 'none';
  filterInput.value = '';
});
