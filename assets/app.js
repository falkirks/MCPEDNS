$("#serverName").on("input", function(event){
    var name = $(this).html();
    if(name.length >= 3) {
        if (name == "lbsg") {
            displayFailure();
        }
        else {
            displaySuccess();
        }
    }
    else{
        displayFailure();
    }
});
$("#startButton").click(function(event){
    $("#stepOne").fadeOut();
    $("#stepTwo").fadeIn();
});
function displaySuccess(){
    if($("#failurePanel").is(":visible")) $("#failurePanel").fadeOut();
    $("#successPanel").fadeIn();
}
function displayFailure(){
    if($("#successPanel").is(":visible")) $("#successPanel").fadeOut();
    $("#failurePanel").fadeIn();
}