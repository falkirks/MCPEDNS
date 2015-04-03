$("#serverName").on("input", function(event){
    var name = $(this).html();
    if(name.length >= 3) {
        $.get("/api/isUsed/" + name.toLowerCase(), function(data){
            data = JSON.parse(data);
            if(data.error || data.isUsed) displayFailure();
            else displaySuccess();
        });
    }
    else{
        displayFailure();
    }
});
$("#startButton").click(function(event){
    $("#stepOne").fadeOut();
    $("#stepTwo").fadeIn();
});
$("#stepTwoSubmit").click(function(event){
    event.preventDefault();
    alertify.confirm("Please make sure you own the email you entered. It is the only way you can modify your subscription to this service. The email you entered was <b>" + $("#email").val() + "</b>",
        function(){
            $.post("/api/claim", {name: $("#serverName").html(), ip: $("#serverIp").val(), email: $("#email").val(), challenge: $("#recaptcha_challenge_field").val(), response: $('#recaptcha_response_field').val()}, function(data){
                data = JSON.parse(data);
                if(data.error){
                    alertify.message(data.message);
                }
                else{
                    $("#serverName").html("yourNameHere");
                    $("#stepTwo").fadeOut();
                    $("#successPanel").fadeOut();
                    $("#stepOne").fadeIn();
                    alertify
                        .alert("Hostname successfully created!").set('label', 'Alright!');
                    $("#serverIp").val('');
                    $("#email").val('');
                    $('#recaptcha_reload').click();
                }
            });
        },
        function(){
            alertify.error('Enter an email that you have access to.');
        }).set('labels', {ok:"Yep, that's my email", cancel:'Naa!'});
});
function displaySuccess(){
    if($("#failurePanel").is(":visible")) $("#failurePanel").fadeOut();
    $("#successPanel").fadeIn();
}
function displayFailure(){
    if($("#successPanel").is(":visible")) $("#successPanel").fadeOut();
    $("#failurePanel").fadeIn();
}