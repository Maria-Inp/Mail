document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // when click submit
  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});
    
function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  document.querySelector('#compose-recipients').disabled = false;

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
    
function send_email() {
  // get value from compose view and post it
  const body = document.querySelector('#compose-body').value;
  const subject = document.querySelector('#compose-subject').value;
  const recipient = document.querySelector('#compose-recipients').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify ({
      body: body,
      subject: subject,
      recipients: recipient
    })
  })
    .then(response => response.json())
    // next what we do
    .then(result => {
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert(result.message)
        load_mailbox('sent');
      }
    })
    .catch(err => console.log(err))

  return false;
}
    
function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // get email and show it
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails)
      emails.forEach(email => {
          console.log(email)
          show_email_box(email, mailbox)
      })
    })
}
    
function show_email_box(email, mailbox) {
  // main div
  const emails_view = document.querySelector('#emails-view');
  
  // div has information 
  const emailBox = document.createElement('div');
  emailBox.id = "email-box-style";

  //div 1
  const senderDiv = document.createElement('div');
  senderDiv.id = "sender-div-style";
  
  if (mailbox === 'inbox') {
      senderDiv.innerHTML = email.sender
  } else {
      // if click on sent box
      senderDiv.innerHTML = email.recipients
  }

  //div 2
  const subjectDiv = document.createElement('div');
  subjectDiv.id = "subject-div-style";
  subjectDiv.innerHTML = email.subject

  //div 3
  const timeDiv = document.createElement('div');
  timeDiv.id = "time-div-style";
  timeDiv.innerHTML = email.timestamp;

  emailBox.append(senderDiv, subjectDiv, timeDiv);

  // read or not (change backgroundcolor)
  if (email.read) {
    emailBox.className = "read pointer";
  } else {
    emailBox.className = "unread pointer";
  }

  emailBox.addEventListener('click', function(){
    show_email_details(email, mailbox)
  })
  
  emails_view.append(emailBox);
}
    
function show_email_details(email, mailbox) {
  fetch(`/emails/${email.id}`)
    .then(response => response.json())
    .then(email => {
      console.log(email.id)
      document.querySelector('#email-details').style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#emails-view').style.display = 'none';
      
      const email_details = document.querySelector('#email-details');
      email_details.innerHTML = '';
      
      const details_box = document.createElement('div');
      details_box.id = "detail-box-style";

      // from
      const fromName = document.createElement('div');
      fromName.id = "from-name-style";
      fromName.className = "mr-3";
      fromName.innerHTML = "From: ";
    
      const fromContent = document.createElement('div');
      fromContent.id = "from-content-style";
      fromContent.innerHTML = email.sender;
    
      const fromDiv = document.createElement('div');
      fromDiv.id = "from-div-style";
      fromDiv.append(fromName, fromContent);
      
      // to
      const toName = document.createElement('div');
      toName.id = "to-name-style";
      toName.className = "mr-3";
      toName.innerHTML = "To: ";

      const toContent = document.createElement('div');
      toContent.id = "to-content-style"
      toContent.innerHTML = email.recipients;

      const toDiv = document.createElement('div');
      toDiv.id = "to-div-style";
      toDiv.append(toName, toContent);

      // subject
      const subjectName = document.createElement('div');
      subjectName.id = "subject-name-style";
      subjectName.className = "mr-3";
      subjectName.innerHTML = "Subject: ";

      const subjectContent = document.createElement('div');
      subjectContent.id = "subject-content-style";
      subjectContent.innerHTML = email.subject;

      const subjectDiv = document.createElement('div');
      subjectDiv.id = "subject-detail-style";
      subjectDiv.append(subjectName, subjectContent);

      // time
      const timeName = document.createElement('div');
      timeName.id = "time-name-style";
      timeName.className = "mr-3";
      timeName.innerHTML = "Time: ";

      const timeContent = document.createElement('div');
      timeContent.id = "time-content-style";
      timeContent.innerHTML = email.timestamp;

      const timeDiv = document.createElement('div');
      timeDiv.id = "time-detail-style";
      timeDiv.append(timeName, timeContent);


      //reply
      const replyButton = document.createElement('button');
      replyButton.className = "btn btn-primary mr-2";
      replyButton.innerHTML = "Reply";
      replyButton.addEventListener('click', function() {
          compose_email();

          document.querySelector('#compose-recipients').value = email.sender;
          document.querySelector('#compose-recipients').disabled = true;

          let subject = email.subject;
          if (subject.split(' ',1)[0] != "Re:") {
              subject = "Re: "+email.subject;
          }
          document.querySelector('#compose-subject').value = subject;
          document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}\n--------------\n`;
      });

      details_box.append(fromDiv, toDiv, subjectDiv, timeDiv, replyButton);

      const bodyDiv = document.createElement('div')
      bodyDiv.innerHTML = email.body

      //archive button
      if (mailbox === "inbox") {
        const archiveButton = document.createElement('button');
        archiveButton.innerHTML = "Archive"
        archiveButton.className = "btn btn-warning"
        archiveButton.addEventListener('click', function() {
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify ({
              archived: true
            })
          })
            .then(function() {
              load_mailbox('inbox')
            })
        })

        details_box.append(archiveButton)

      } else if (mailbox === "archive") {
        const unarchiveButton = document.createElement('button');
        unarchiveButton.innerHTML = "Unarchive"
        unarchiveButton.className = "btn btn-secondary"
        unarchiveButton.addEventListener('click', function() {
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify ({
              archived: false
            })
          })
            .then(function() {
              load_mailbox('inbox')
            })
        })

        details_box.append(unarchiveButton)
      }

      const hr = document.createElement('hr')

      details_box.append(hr, bodyDiv)
    
      if (!email.read) {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
      }

      email_details.append(details_box);
    })
}  