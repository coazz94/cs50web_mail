document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //fetch this link via GET
  fetch(`/emails/${mailbox}`)
  //get response, and get the mails 
  .then(response => response.json())
  .then(emails => {
    // for every mail make a new div
    for(let i of Object.keys(emails)){

      // make a new div and add a class to it
      const element = document.createElement('div');

      // add to the innerHTML the emailinfo hat shoudl be presented
      element.innerHTML = `
        <p class="col" >${emails[i].sender}</p>
        <p class="col">${emails[i].subject}</p>
        <p class="col">${emails[i].timestamp}</p>
      `;
      
      //add class to the mail if read or not
      element.className = emails[i].read ? "row border border-dark read" : "row border border-dark unread"


      // load the funciton display_mail when clicked on it
      element.addEventListener("click", function () {
        mark_read(emails[i].id)
        display_mail(emails[i].id)
      })

      //add to the div in the inbox.html
      document.querySelector('#emails-view').append(element);
    }
  })
}

function send_mail(){

  //Get the values of the form 
  const recipients = document.querySelector('#compose-recipients').value
  const subject = document.querySelector('#compose-subject').value 
  const body = document.querySelector('#compose-body').value 

  //fetch to this link and post the data that was in the form
  fetch(`/emails`, {
    method: "POST", 
    body : JSON.stringify({
      recipients : recipients, 
      subject: subject, 
      body : body
    })
  })
  //see the resposne and then print the result and load the mailbox sent
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox("sent");
  });
}

function display_mail(email_id){

  // get the info from the email clicked on 
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(mail => {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#read-view').style.display = 'block';
    
    
    document.querySelector("#read-view").innerHTML = `
    <div><strong>From: </strong>${mail.sender}</div>
    <div><strong>To: </strong>${mail.recipients}</div>
    <div><strong>Subject: </strong>${mail.subject}</div>
    <div>${mail.timestamp}</div>
    <hr class="solid">
    <div>${mail.body}</div>
    `

    

  })


}


function mark_read(emails_id){
  fetch(`/emails/${emails_id}`, {
    method: "PUT", 
    body: JSON.stringify({
      read : true
    })
  })
}