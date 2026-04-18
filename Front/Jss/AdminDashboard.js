  // Set current date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('date-display').innerText = new Date().toLocaleDateString(undefined, options);