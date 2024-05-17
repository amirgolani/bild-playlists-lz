
function handleLinks(theID) {
    var fileIn = document.getElementsByName(`file_${theID.split('_')[1]}`);
    var linkIn = document.getElementsByName(theID);

    if (linkIn[0].value.length === 0) {
        fileIn[0].disabled = false;
    }

    if (linkIn[0].value.length !== 0) {
        fileIn[0].disabled = true
    }
}


var boxCounter = 1;

function handleList(remove) {
    var boxesContainer = document.getElementById('boxes-container');

    if (remove) {
        // Remove the last box
        var lastBox = boxesContainer.lastElementChild;
        if (lastBox && boxCounter > 1) {
            boxesContainer.removeChild(lastBox);
            boxCounter--;
        }
    } else {
        if (boxCounter < 13) {
            // Add a new box
            var newBox = document.createElement('div');
            newBox.className = 'box p-2 my-2';
            newBox.id = 'box_' + (boxCounter + 1);
            newBox.innerHTML = boxesContainer.firstElementChild.innerHTML; // Clone the first box
            updateBoxAttributes(newBox, boxCounter + 1);
            boxesContainer.appendChild(newBox);
            boxCounter++;
            // Set focus on the first input or select element in the new box
            var firstInputOrSelect = newBox.querySelector('input, select');
            if (firstInputOrSelect) {
                firstInputOrSelect.focus();
            }
        }
    }
}

function updateBoxAttributes(box, counter) {
    var inputsAndSelects = box.querySelectorAll('input, select, label.checkbox');
    inputsAndSelects.forEach(function (inputOrSelect) {
        if (inputOrSelect.tagName === 'INPUT' || inputOrSelect.tagName === 'SELECT') {
            var currentName = inputOrSelect.name;
            var newName = currentName.replace(/\d+/, counter);
            inputOrSelect.name = newName;
            inputOrSelect.value = "";
        }
    });
}



function blockCharacters(event, blockedChars) {
    const inputElement = event.target;
    let inputValue = inputElement.value;

    // Check each blocked character
    blockedChars.forEach(blockedChar => {
        if (inputValue.includes(blockedChar)) {
            // Block the character by removing it from the input value
            inputValue = inputValue.replace(new RegExp(blockedChar, ''), '');

            // Optionally, you can inform the user about the blocked character
            alert(`Character "${blockedChar}" is disabled.`);
        }
    });

    // Update the input value
    inputElement.value = inputValue;
}


document.getElementById('uploadForm').addEventListener('submit', function (event) {
    event.preventDefault();

    var gp = document.getElementById('gp').value;
    var title = document.getElementById('title').value;
    var sub = document.getElementById('sub').value;

    console.log(gp, title, sub)

    var formData = new FormData(this);

    document.getElementById("commsIconM").classList.remove("is-hidden")
    // document.getElementById("commsIconS").classList.add("is-hidden")

    fetch(`/playlist?gp=${gp}&title=${title}&subline=${sub}`, {
        method: 'POST',
        body: formData
    })
        .then(async response => {
            if (response.ok) {
                // Success: Show an alert or perform any other success action
                var lastUpdate = await response.json()
                console.log(lastUpdate.url)
                // var d = new Date(lastUpdate[0].lastUpdate)
                // alert(d.toString().split('GMT')[0]);
                // document.getElementById('lastUpdateSpan').textContent = lastUpdate;

                document.getElementById("commsIconM").classList.add("is-hidden")
                document.getElementById("returnedLink").classList.remove("is-hidden")
                console.log()

            } else {
                // Error: Log the error to the console
                console.error('Form submission failed:', response.statusText);
            }
        })
        .catch(error => {
            // Error: Log the error to the console
            console.error('Error during form submission:', error);
        });
});
