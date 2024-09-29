$(document).ready(function() {
    $('#searchButton').on('click', function() {
        const inputValue = $('#searchInput').val();

        $.ajax({
            url: `${process.env.API_URL}/search`, // Adjust according to your API endpoint
            type: 'GET',
            data: {
                query: inputValue // Sending the input value as a query parameter
            },
            headers: {
                'X-Access-Key': process.env.ACCESS_KEY // Include any necessary headers
            },
            success: function(data) {
                console.log(data); // Do something with the response data
                // Update your UI with the fetched data
            },
            error: function(xhr, status, error) {
                console.error('Error fetching data from API:', error);
                // Handle the error
            }
        });
    });
});
