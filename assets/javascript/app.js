/*Javascript for RPS multiplayer game (Week 7 Homework )*/


$(document).ready(function() {


    // Initialize Firebase

    var config = {
        apiKey: "AIzaSyCQg7h8y1v_huCul8MAs7WPe2gbJq3qTiY",
        authDomain: "rpsmultiplayer-c5590.firebaseapp.com",
        databaseURL: "https://rpsmultiplayer-c5590.firebaseio.com",
        projectId: "rpsmultiplayer-c5590",
        storageBucket: "",
        messagingSenderId: "280457182894"
    };

    firebase.initializeApp(config);

    var database = firebase.database();



    /* --- global variables -- */

    var ref = database.ref();

    var players = ref.child("players");
    var turn = ref.child("turn");
    var chat = ref.child("chat");



    /* --- objects -- */

    var Game = {

        youAre: "",
        underway: false,
        winner: 0,

        player1Name: "",
        player2Name: "",



        set_up: function() {

            var elemInput = $('<input>');
            elemInput.attr('type', 'text').addClass('input-name').attr('id', 'input-name').attr('placeholder', 'Name');

            var elemBtn1 = $('<button>');
            elemBtn1.attr('type', 'submit').addClass('btn-submit').attr('id', 'btn-submit').text('Start');


            $('#login').empty();
            $('#login').append(elemInput).append(elemBtn1);

            $('#center-box').empty();

            turn.child("turn").set("1");

        },


        process_P1choice: function(choice) {

            $('#player1-rps').empty();
            $('#player1-rps').text(choice);

            players.child("p1/choice").set(choice);

            turn.child("turn").set("2");

        },


        process_P2choice: function(choice) {

            $('#player2-rps').empty();
            $('#player2-rps').text(choice);

            players.child("p2/choice").set(choice);

            turn.child("turn").set("show");

        },

    };



    /* --- calls -- */

    Game.set_up();



    /* --- handlers -- */


    // add a new player to the database when submit button pressed

    $('#btn-submit').on('click', function(event) {
        event.preventDefault();

        var input = $('#input-name').val().trim();

        if (input != "") {

            players.once("value")
                .then(function(snapshot) {

                    var newPlayer = {};

                    if (!snapshot.child("p1").exists() && !snapshot.child("p2").exists()) {

                       Game.youAre = "player1";

                        newPlayer = {
                        name: input.charAt(0).toUpperCase() + input.slice(1),
                        wins: 0,
                        losses: 0,
                        choice: "",

                        };

                        players.child("p1");
                        players.child("p1").set(newPlayer);

                        players.child("p1").onDisconnect().remove();

                        $('#login').text("Hi " + newPlayer.name + ", you are player 1.");


                    } else if (snapshot.child("p1").exists() && !snapshot.child("p2").exists()) {

                        Game.youAre = "player2";

                        newPlayer = {
                        name: input.charAt(0).toUpperCase() + input.slice(1),
                        wins: 0,
                        losses: 0,
                        choice: "",

                        };

                        players.child("p2");
                        players.child("p2").set(newPlayer);

                        players.child("p2").onDisconnect().remove();

                        $('#login').text("Hi " + newPlayer.name + ", you are player 2.");



                    } else if (!snapshot.child("p1").exists() && snapshot.child("p2").exists()) {

                        Game.youAre = "player1";

                        newPlayer = {
                        name: input.charAt(0).toUpperCase() + input.slice(1),
                        wins: 0,
                        losses: 0,
                        choice: "",

                        };

                        players.child("p1");
                        players.child("p1").set(newPlayer);

                        players.child("p1").onDisconnect().remove();

                        Game.youAre = "player1"; console.log(Game.youAre)

                        $('#login').text("Hi " + newPlayer.name + ", you are player 1.");


                    } else { alert("There are already two players in this game. Try again later"); }


                });

        }

    });



    // if a player is adde to the database, then update page with details
    // set current user to either player 1 or two using 'Game.youAre'
    // when two users have been added - set game underwat to true so this code won't run again every time mplayer is updated during the game

    players.on("value", function(snapshot) {

        var player1 = "";
        var player2 = "";
        var msgRef = "";
        var newMsg = "";

        if (!Game.underway) {

            if (snapshot.child("p1").exists()) {

                player1 = snapshot.val().p1;
                $('#player1-name').text(player1.name);
                $('#player1-stats').text("Wins: " + player1.wins + " , Losses: " + player1.losses);

                if (snapshot.child("p2").exists()) {

                    player2 = snapshot.val().p2;
                    $('#player2-name').text(player2.name);
                    $('#player2-stats').text("Wins: " + player2.wins + " , Losses: " + player2.losses);

                    if (Game.youAre == "player1") {

                        var elemRock = $('<p>').addClass('rps-text').attr('id', 'p1-rock').text('Rock');
                        var elemPaper = $('<p>').addClass('rps-text').attr('id', 'p1-paper').text('Paper');
                        var elemScissors = $('<p>').addClass('rps-text').attr('id', 'p1-scissors').text('Scissors');

                        $('#player1-rps').append(elemRock).append(elemPaper).append(elemScissors);
                        $('#player1-rps').removeClass("choice");
                    }

                    $('#status').text("Waiting for player 1 to choose ...");

                    $('#player1-box').addClass("box-active");

                    Game.underway = true; // both players present so run the game

                    Game.player1Name = snapshot.val().p1.name;
                    Game.player2Name = snapshot.val().p2.name;

                    chat.push().set("--------------------------------");
                    chat.push().set("New chat session");
                    chat.push().set("--------------------------------");

                }

            } else { $('#player1-name').text("Waiting for player 1 ..."); }


            // in case player 2 quits leaving player 1 alone

            if (snapshot.child("p2").exists()) {

                player2 = snapshot.val().p2;
                $('#player2-name').text(player2.name);
                $('#player2-stats').text("Wins: " + player2.wins + " , Losses: " + player2.losses);

            } else { $('#player2-name').text("Waiting for player 2 ..."); }

        }

    });



    // event handlers for when player one makes a choice by clicking rock paper or scissors

    $(document).on('click', '#p1-rock', function() { Game.process_P1choice('Rock'); });
    $(document).on('click', '#p1-paper', function() { Game.process_P1choice('Paper'); });
    $(document).on('click', '#p1-scissors', function() { Game.process_P1choice('Scissors'); });



    //listen for change to player one's choice and set-up player two to choose

    turn.on("value", function(snapshot) {

        if (Game.underway && snapshot.val().turn == "2") {

            if (Game.underway) {

                if (Game.youAre == "player2") {

                    var elemRock = $('<p>').addClass('rps-text').attr('id', 'p2-rock').text('Rock');
                    var elemPaper = $('<p>').addClass('rps-text').attr('id', 'p2-paper').text('Paper');
                    var elemScissors = $('<p>').addClass('rps-text').attr('id', 'p2-scissors').text('Scissors');

                    $('#player2-rps').empty();
                    $('#player2-rps').append(elemRock).append(elemPaper).append(elemScissors);
                    $('#player2-rps').removeClass("choice");
                }

                $('#status').text("Player 2 is choosing ...");

                $('#center-box').removeClass("box-active");
                $('#player1-box').removeClass("box-active");
                $('#player2-box').addClass("box-active");

            }
          }
    });



    // event handlers for when player one makeds a choice by clicking rock paper or scissors

    $(document).on('click', '#p2-rock', function() { Game.process_P2choice('Rock'); });
    $(document).on('click', '#p2-paper', function() { Game.process_P2choice('Paper'); });
    $(document).on('click', '#p2-scissors', function() { Game.process_P2choice('Scissors'); });



    // listen for player 2 choice then run game logic to establish winner
    // update page and database with winner name, wins/losses 

    turn.on("value", function(snapshot) {

        if (Game.underway && snapshot.val().turn == "show") {


          players.once("value")
                .then(function(playerinfo) {

                    var player1Choice = playerinfo.val().p1.choice;
                    var player2Choice = playerinfo.val().p2.choice;

            $('#player1-rps').text(player1Choice).addClass("choice");
            $('#player2-rps').text(player2Choice).addClass("choice");

            if (player1Choice == "Rock" && player2Choice == "Paper") { Game.winner = 2; } 
            else if (player1Choice == "Rock" && player2Choice == "Scissors") { Game.winner = 1; } 
            else if (player1Choice == "Paper" && player2Choice == "Scissors") { Game.winner = 2; } 
            else if (player1Choice == "Paper" && player2Choice == "Rock") { Game.winner = 1; } 
            else if (player1Choice == "Scissors" && player2Choice == "Rock") { Game.winner = 2; } 
            else if (player1Choice == "Scissors" && player2Choice == "Paper") { Game.winner = 1; } 
            else { Game.winner = 0; }

                    var player1Wins = playerinfo.val().p1.wins;
                    var player1Losses = playerinfo.val().p1.losses;


                    var player2Wins = playerinfo.val().p2.wins;
                    var player2Losses = playerinfo.val().p2.losses;

                    if (Game.winner == 1) {

                        $('#center-box').text(Game.player1Name + " wins!"); 

                        player1Wins++;
                        player2Losses++;

                        players.child("p1/wins").set(player1Wins);
                        players.child("p2/losses").set(player2Losses);

                    } else if (Game.winner == 2) {

                        $('#center-box').text(Game.player2Name + " wins!"); 

                        player2Wins++;
                        player1Losses++;

                        players.child("p2/wins").set(player2Wins);
                        players.child("p1/losses").set(player1Losses);


                    } else { $('#center-box').text("Tie!"); }                      
                   
                    $('#player1-stats').text("Wins: " + player1Wins + " , Losses: " + player1Losses);
                    $('#player2-stats').text("Wins: " + player2Wins + " , Losses: " + player2Losses);


                    $('#center-box').addClass("box-active").addClass("win-txt");
                    $('#player1-box').removeClass("box-active");
                    $('#player2-box').removeClass("box-active");


                });

            setTimeout(function() { turn.child("turn").set("1"); }, 4000);

        }

    });


    // when datbase key 'turn' set to 1 again indicates next game
    // setup for new game

    turn.on("value", function(snapshot) {

        if (Game.underway && snapshot.val().turn == "1") {

            $('#player1-rps').empty();
            $('#player2-rps').empty();
            $('#center-box').empty();

            if (Game.youAre == "player1") {

                var elemRock = $('<p>').addClass('rps-text').attr('id', 'p1-rock').text('Rock');
                var elemPaper = $('<p>').addClass('rps-text').attr('id', 'p1-paper').text('Paper');
                var elemScissors = $('<p>').addClass('rps-text').attr('id', 'p1-scissors').text('Scissors');

                $('#player1-rps').append(elemRock).append(elemPaper).append(elemScissors);
                $('#player1-rps').removeClass("choice");

            }

            $('#status').text("Waiting for player 1 to choose ...");

            $('#center-box').removeClass("box-active").removeClass("win-txt");
            $('#player1-box').addClass("box-active");
            $('#player2-box').removeClass("box-active");
        }

    });


    // when a player is remoived from the database (by a disconnect) reset ready for replacement player

    players.on("child_removed", function(snapshot) {

        var msgRef = "";
        var newMsg = "";

        Game.underway = false;
        turn.child("turn").set("1");

        players.once("value")
            .then(function(remaining) {

                if (remaining.child("p1").exists()) {

                    newMsg = "Player 2 has disconnected!";
                    msgRef = chat.push();
                    msgRef.set(newMsg);

                    $('#player1-rps').empty();
                    $('#player1-rps').empty();
                    $('#player2-stats').empty();

                    $('#player2-name').text("Waiting for a new player ...");
                }


                if (remaining.child("p2").exists()) {

                    newMsg = "Player 1 has disconnected!";
                    msgRef = chat.push();
                    msgRef.set(newMsg);

                    $('#player2-rps').empty();
                    $('#player2-rps').empty();
                    $('#player1-stats').empty();

                    $('#player1-name').text("Waiting for a new player ...");
                }

        });

        $('#status').text("The other player has left the game!");
        $('#center-box').empty();

    });

    // when a chat message is sent, push message to create new chilld message and push to database

    $('#chat-submit').on("click", function(event) {
        event.preventDefault();

        var msgName = "";

        if ($("#chat-msg").val() != "" && Game.underway) {

            if (Game.youAre == "player1") { msgName = Game.player1Name; } else { msgName = Game.player2Name; }

            newMsg = msgName + ": " + $("#chat-msg").val().trim(); 
            chat.push().set(newMsg);

            $("#chat-msg").val("");
            
        }

    });


    // When new message added to database, get it, add to the message box with different colour for player 1 and player 2

    chat.on("child_added", function(snapshot) {

        var chatMsg = snapshot.val();
        var elemChat = $('<div>').text(chatMsg);

        if (!Game.underway) { elemChat.addClass("msg-color0"); }

          else if (chatMsg.startsWith(Game.player1Name)) { elemChat.addClass("msg-color1"); } 

              else { elemChat.addClass("msg-color2"); }

        $('#chat-text').append(elemChat);
        $('#chat-text').scrollTop(10000); // scroll to bottom of list messages

    });




}); /*close of document ready function*/