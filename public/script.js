const errorBox = document.querySelector('#error'),
successBox = document.querySelector('#success'),
form = document.querySelector('#form'),
submit = document.querySelector('.form__submit');  

const validate = () => {
   const formData = new FormData(document.querySelector('#form'));

   fetch('/send', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({
           name: formData.get('name').trim(),
           email: formData.get('email').trim(),
           message: formData.get('message').trim()
       }),
   })
   .then(res => {
       if(res.ok) {
           return res.json();
       } 
       else {
        errorBox.innerHTML = `Something went wrong, try again later`;
        errorBox.style.display = 'block';
        return;
       }
   })
   .then(data => {        
       errorBox.style.display = 'block';
       successBox.style.display = 'none';
       errorBox.innerHTML = ``;
       for(let i=0; i < data.error.length; i++) {
           errorBox.innerHTML += `<p class="form-res-text">${data.error[i].msg}</p>`;
       }
   })
   .catch(noError => {
        validateFile();   
   })
   return false;
}

const validateFile = () => {
    const fileData = new FormData();
    const fileInput = document.querySelector('#image');
    
    for(const file of fileInput.files) {
        fileData.append('image', file)
    }

    fetch('/send_file', {
        method: 'POST',
        body: fileData,
    })
    .then(res => {
        if(res.ok) {
            form.style.display = 'none';
            error.style.display = 'none';
            errorBox.style.display = 'none';
            successBox.style.display = 'block';
            //form.reset();
            return;
        } else {
            errorBox.innerHTML = `<p class="form-res-text">There is something wrong with your file, make sure its an image and is not larger than 4mb</p>`;
            errorBox.style.display = 'block';
            return;
        }
    })
}