// Whenever someone clicks a p tag
$(document).on("click", ".getNotes", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  $("button[clicked]").attr("clicked", "no");
  $(this).attr("clicked", "yes");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      window.location.reload();
      // console.log(data);
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function(event) {
  event.preventDefault();

  var thisId = $(this).attr("data-id");
  var thisBody = $("#bodyinput").val();
  var thisEval = $("#NivelChayotez option:selected").text();
  var thisTitle = $("#nombreColumna").text();

  // Test console.
  console.log(thisId);
  console.log(thisBody);
  console.log(thisEval);
  console.log(thisTitle);

  if (thisBody !== "" && thisEval !== "Seleccionar") {
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: thisTitle,
        quality: thisEval,
        body: thisBody
      }
    }).then(function(data) {
      
      window.location.reload();
    });

    $("#NivelChayotez").val("");
    $("#bodyinput").val("");
  }
});
