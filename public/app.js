


// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br/>" + data[i].link + "</p>");
  }
});


// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h3>" + data.title + "</h3>");

      $("#notes").append("<h4>" + "Add Title" + "</4>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='section' >");

      $("#notes").append("<h4>" + "Add Note" + "</4>");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body' ></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      $("#notes").append("<button data-id='" + data._id + "' id='deletenote'>Delete Note</button>");


      

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
// Add comment to article and update comments display
  $(document).on('click','#addComment', function(){
    if($('#commentText').val() != '') {
      var name = $('#name').val();
      var note = $('#noteText').val();
      $.post("/addcomment/" + articleId, {name: name, note: note}, function(e) {
        e.preventDefault();
      });
      $('#name').val('');
      $('#noteText').val('');
      showComments(articleId);
    }
  }); 



// Delete comment from article and update comments display
  $(document).on('click','#deletenote', function(){
    var thisId = $(this).attr("data-id");
    // thisId = this.id;
    // console.log("comment id "+ commentId);
    $.ajax({
      method: "GET",
      url:"/deletecomment/" + thisId
    }).done(function(data){
    })
    $("#notes").append("<button data-id='" + data._id + "' id='deletenote'>Delete Note</button>");
    showComments(thisId);
  });   



 
