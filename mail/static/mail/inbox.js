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
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';
  document.querySelector('#error-message').style.display = 'none';

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
  document.querySelector('#error-message').style.display = 'none';


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

  //to see the error message
  event.preventDefault();

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
      body : "\n" + body + "\n"
    })
  })
  //see the resposne and then print the result and load the mailbox sent
  // If the response is not ok, then return an error else send the mail
  .then(response =>{
    if(!response.ok) {
      return response.text().then(text => {throw new Error(text), show_error(text)})
    }else{
      return response.json().then(result => {console.log(result), load_mailbox("sent")})
    } 
    })
    .catch(err => {
      console.log("There was a fatal error", err);
    });

}

function display_mail(email_id){

  console.log("This is the email_id: ", email_id)

  // get the info from the email clicked on 
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(mail => {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#error-message').style.display = 'none';
    document.querySelector('#read-view').style.display = 'block';
    
    // Change the inner html of the read view to display the email
    document.querySelector("#read-view").innerHTML = `
    <div><strong>From: </strong>${mail.sender}</div>
    <div><strong>To: </strong>${mail.recipients}</div>
    <div><strong>Subject: </strong>${mail.subject}</div>
    <div>${mail.timestamp}</div>
    <div id="button_place"></div>
    <hr class="solid">
    <div>${mail.body}</div>
    `

    //if user is sender = mail is in sent, so dont display the button for archieving
    //TODO

    //Create a button, and add a event listenr to trigger the function to change the archieve property
    const button_arch = document.createElement("button")
    button_arch.className = mail.archived ? "btn btn-warning btn-sm" : "btn btn-primary btn-sm"
    button_arch.innerHTML = !mail.archived ? "Archive" : "Unarchieve"
    
    button_arch.addEventListener("click", function (){
      change_archieve(email_id, mail.archived)
    });

    //make the button for the replay
    const button_replay = document.createElement("button")
    button_replay.className = "btn btn-info btn-sm"
    button_replay.innerHTML = "Replay"

    button_replay.addEventListener("click", function () {
      replay_mail(mail)
    })

    //Append ther buttons to the read view
    document.querySelector("#button_place").append(button_arch, button_replay);

  })
}

function mark_read(emails_id){
  //Fetch ther mail an change the status to read
  fetch(`/emails/${emails_id}`, {
    method: "PUT", 
    body: JSON.stringify({
      read : true
    })
  })
}

function mark_unread(emails_id){
  //Fetch ther mail an change the status to unread ( Just for testing)
  fetch(`/emails/${emails_id}`, {
    method: "PUT", 
    body: JSON.stringify({
      read : false
    })
  })
  console.log("Done")
}

function change_archieve(emails_id, state){
  //Fetch ther mail an change the archieved status to true or false 
  fetch(`/emails/${emails_id}`, {
    method: "PUT", 
    body: JSON.stringify({
      archived : !state
    })
  })
  .then(() => load_mailbox("inbox"));
}

function replay_mail(mail){
  //Load the compose email Page
  compose_email()
  //save the subject in to a let
  let subject = mail.subject

  //check if subject contains RE:, if not add
  if(subject.split(":")[0] != "RE"){
    subject = "RE: " + subject
  }

  //Prefill the form
  document.querySelector("#compose-recipients").value = mail.sender;
  document.querySelector('#compose-body').value = `On ${mail.timestamp} ${mail.sender} wrote: ${mail.body} \n`;
  document.querySelector("#compose-subject").value = subject;
  
}

function show_error(message){

  //show the div and add the error message to it
  document.querySelector('#error-message').style.display = 'block';
  document.querySelector("#error-message").innerHTML= message;

}