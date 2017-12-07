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



    /* --- setup database structure -- */

    var ref = database.ref();

    var players = ref.child("players");
    var turn = ref.child("turn");
    var chat = ref.child("chat");


    /* --- global variables -- */

    // none!


    /* --- objects -- */


    var Game = {

        youAre: "",
        underway: false,
        winner: 0,


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

        },

    };


    /* --- calls -- */

    Game.set_up();






    /* --- handlers -- */


    $('#btn-submit').on('click', function(event) {
        event.preventDefault();

        var input = $('#input-name').val().trim();

        if (input != "") {

            players.once("value")
                .then(function(snapshot) {

                    if (!snapshot.child("p1").exists() && !snapshot.child("p2").exists()) {

                        var newPlayer = {
                            name: input.charAt(0).toUpperCase() + input.slice(1),
                            wins: 0,
                            losses: 0,
                            choice: "",

                        };

                        players.child("p1");
                        players.child("p1").set(newPlayer);

                        players.child("p1").onDisconnect().remove();

                        Game.youAre = "player1";

                        $('#login').text("Hi " + newPlayer.name + ", you are player 1.");


                    } else if (snapshot.child("p1").exists() && !snapshot.child("p2").exists()) {

                        var newPlayer = {
                            name: input.charAt(0).toUpperCase() + input.slice(1),
                            wins: 0,
                            losses: 0,
                            choice: "",

                        };

                        players.child("p2");
                        players.child("p2").set(newPlayer);

                        players.child("p2").onDisconnect().remove();

                        Game.youAre = "player2";

                        $('#login').text("Hi " + newPlayer.name + ", you are player 2.");



                    } else if (!snapshot.child("p1").exists() && snapshot.child("p2").exists()) {

                        var newPlayer = {
                            name: input.charAt(0).toUpperCase() + input.slice(1),
                            wins: 0,
                            losses: 0,
                            choice: "",

                        };

                        players.child("p1");
                        players.child("p1").set(newPlayer);

                        players.child("p1").onDisconnect().remove();

                        Game.youAre = "player1";

                        $('#login').text("Hi " + newPlayer.name + ", you are player 1.");


                    } else { alert("There are already two players in this game. Try again later"); }


                });

        }

    });


    // if a player is adde to the database, then update page with details
    // set current user to either player 1 or two using 'Game.youAre'
    // when two users have been added - set game underwat to true so this code won't run again every time mplayer is updated during the game


    players.on("value", function(snapshot) {

        if (!Game.underway) {

            if (snapshot.child("p1").exists()) {

                if (snapshot.child("p2").exists()) {

                    var player2 = snapshot.val().p2;
                    $('#player2-name').text(player2.name);
                    $('#player2-stats').text("Wins: " + player2.wins + " , Losses: " + player2.losses);


                    if (Game.youAre == "player1") {

                        var elemRock = $('<p>').addClass('rps-text').attr('id', 'p1-rock').text('Rock');
                        var elemPaper = $('<p>').addClass('rps-text').attr('id', 'p1-paper').text('Paper');
                        var elemScissors = $('<p>').addClass('rps-text').attr('id', 'p1-scissors').text('Scissors');

                        $('#player1-rps').append(elemRock).append(elemPaper).append(elemScissors);
                        $('#player1-rps').removeClass("choice")
                    }

                    $('#status').text("Waiting for player 1 to choose ...");

                    $('#player1-box').addClass("box-active");

                    Game.underway = true; // both players present so run the game

                } else {

                    var player1 = snapshot.val().p1;
                    $('#player1-name').text(player1.name);
                    $('#player1-stats').text("Wins: " + player1.wins + " , Losses: " + player1.losses);

                }

            } else { $('#player1-name').text("Waiting for player 1 ..."); }


            // in case player 2 quits leaving player 1 alone

            if (snapshot.child("p2").exists()) {

                var player2 = snapshot.val().p2;
                $('#player2-name').text(player2.name);
                $('#player2-stats').text("Wins: " + player2.wins + " , Losses: " + player2.losses);

            } else { $('#player2-name').text("Waiting for player 2 ..."); }

        }

    });

    // event handlers for when player one makes a choice by clicking rock paper or scissors

    $(document).on('click', '#p1-rock', function() { Game.process_P1choice('Rock'); });
    $(document).on('click', '#p1-paper', function() { Game.process_P1choice('Paper'); });
    $(document).on('click', '#p1-scissors', function() { Game.process_P1choice('Scissors'); });


    // listen for change to player one's choice and set-up player two to choose

    players.child("p1/choice").on("value", function(snapshot) {

        Game.player1Choice = snapshot.val();

        if (Game.underway) {

            $('#player1-rps').empty();
            $('#player1-rps').text(Game.player1Choice).addClass("choice");



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

    });


    // event handlers for when player one makeds a choice by clicking rock paper or scissors


    $(document).on('click', '#p2-rock', function() { Game.process_P2choice('Rock'); });
    $(document).on('click', '#p2-paper', function() { Game.process_P2choice('Paper'); });
    $(document).on('click', '#p2-scissors', function() { Game.process_P2choice('Scissors'); });


    // listen for player 2 choice then run game logic to establish winner
    // update page and database with winner name, wins/losses 


    players.child("p2").child("choice").on("value", function(snapshot) {

        if (Game.underway) {

            Game.player2Choice = snapshot.val(); // place choice from database into global variable

            $('#player1-rps').text(Game.player1Choice).addClass("choice");
            $('#player2-rps').text(Game.player2Choice).addClass("choice");

            if (Game.player1Choice == "Rock" && Game.player2Choice == "Paper") { Game.winner = 2; } 
            else if (Game.player1Choice == "Rock" && Game.player2Choice == "Scissors") { Game.winner = 1; } 
            else if (Game.player1Choice == "Paper" && Game.player2Choice == "Scissors") { Game.winner = 2; } 
            else if (Game.player1Choice == "Paper" && Game.player2Choice == "Rock") { Game.winner = 1; } 
            else if (Game.player1Choice == "Scissors" && Game.player2Choice == "Rock") { Game.winner = 2; } 
            else if (Game.player1Choice == "Scissors" && Game.player2Choice == "Paper") { Game.winner = 1; } 
            else { Game.winner = 0; }

            players.once("value")
                .then(function(snapshot) {

                    var player1Name = snapshot.val().p1.name;
                    var player1Wins = snapshot.val().p1.wins;
                    var player1Losses = snapshot.val().p1.losses;

                    var player2Name = snapshot.val().p2.name;
                    var player2Wins = snapshot.val().p2.wins;
                    var player2Losses = snapshot.val().p2.losses;

                    if (Game.winner == 1) {

                        $('#center-box').addClass("win-txt").addClass("box-active").text(player1Name + " wins!");
                        $('#player1-box').removeClass("box-active");
                        $('#player2-box').removeClass("box-active");

                        player1Wins++;
                        player2Losses++;

                        players.child("p1/wins").set(player1Wins);
                        players.child("p2/losses").set(player2Losses);

                    } else if (Game.winner == 2) {

                        $('#center-box').text(player2Name + " wins!");

                        player2Wins++;
                        player1Losses++;

                        players.child("p2/wins").set(player2Wins);
                        players.child("p1/losses").set(player1Losses);


                    } else { $('#center-box').text("Tie!"); }

                    $('#player1-stats').text("Wins: " + player1Wins + " , Losses: " + player1Losses);
                    $('#player2-stats').text("Wins: " + player2Wins + " , Losses: " + player2Losses);

                });

            setTimeout(function() { turn.child("turn").set("1"); }, 2000);

        }

    });

    turn.on("value", function(snapshot) {

        if (Game.underway && snapshot.val().turn == 1) {

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

    players.on("child_removed", function(snapshot) {

        Game.underway = false;
        turn.child("turn").set("1");

        players.once("value")
            .then(function(snapshot) {

                if (snapshot.child("p1").exists()) {

                    $('#status').text("The other player (player 2) has left the game!");
                    $('#chat-text').append("Player 2 has disconnected!");

                    $('#player1-rps').empty();
                    $('#player1-rps').empty();
                    $('#player2-stats').empty();

                    $('#player2-name').text("Waiting for a new player 2...");
                    $('#center-box').empty();
                }


                if (snapshot.child("p2").exists()) {

                    $('#status').text("The other player (player 1) has left the game!");
                    $('#chat-text').append("Player 1 has disconnected!");

                    $('#player2-rps').empty();
                    $('#player2-rps').empty();
                    $('#player1-stats').empty();

                    $('#player1-name').text("Waiting for a new player 1...");
                    $('#center-box').empty();
                }

            });

    });

    $('#chat-submit').on("click", function(event) {
        event.preventDefault();

        if ($("#chat-msg").val() != "" && Game.underway) {

            newMsg = Game.youAre + ": " + $("#chat-msg").val().trim();

            $("#chat-msg").val("");

            var msgRef = chat.push();
            msgRef.set(newMsg);
        }

    });


    chat.on("child_added", function(snapshot) {

        var chatMsg = snapshot.val();
        var elemChat = $('<div>').text(chatMsg);

        if (chatMsg.startsWith("player1")) { elemChat.addClass("msg-color1"); } else { elemChat.addClass("msg-color2"); }

        $('#chat-text').append(elemChat);
        $('#chat-text').scrollTop(10000); 

    });




}); /*close of document ready function*/