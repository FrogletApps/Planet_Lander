//Press "j" to enter/leave debug mode in the game

var canvas = document.getElementById("myCanvas"); //Set up the canvas
var ctx = canvas.getContext("2d");  //Canvas renders things in 2D, do not use WebGL
var lander = document.getElementById("lander"); //Gets the image from the html

//in release versions set debugMode to false (no debug menu)
var debugMode = false;			//boolean, stores whether debug menu should be displayed.

var x = 200;					//X Position of the lander on the canvas
var y = 200;					//Y Position of the lander on the canvas
var dx = 1;						//X Velocity of the lander
var dy = 1;						//Y Velocity of the lander

var thrustArrow;				//Length of the thrust arrow (red)
var leftArrow;					//length of the left arrow (green)
var rightArrow;					//length of the right arrow (green)
var thrustCount = 0;			//works out how long the thrust arrow should be
var arrowvisible = true;		//boolean, stores whether arrows should be visible or not

var fireCount = 1;				//Rapidly changes between 1, 2 and 3 to make three different fire images appear

var rightPressed = false;		//boolean, stores whether "D" key or right arrow button has been pressed
var upPressed = false;			//boolean, stores whether "W" key or up arrow button has been pressed
var leftPressed = false;		//boolean, stores whether "A" key or left arrow button has been pressed

var landed = false;				//boolean, goes true when lander lands correctly
var crashed = false;			//boolean, goes true when lander crashes
var landedstore = 0;			//stores a value (0 for crash, 1 for landed, 2 for bonus) to send to MySQL to store results
var fuelout = false;			//boolean, when the lander has run out of fuel this turns true, and stops the lander controls from working and the lander's flame
var landedVelocityX = 0;		//X velocity of the lander just before it lands to work out whether it should crash or not
var landedVelocityY = 0;		//Y velocity of the lander just before it lands to work out whether it should crash or not

var shadowsize = 0;				//how big the lander's shadow should be

var canvas_x = 0;				//Stores the x position of the mouse at the last click
var canvas_y = 0;				//Stores the y position of the mouse at the last click

var levelnum = -1;				//Stores the level number (integer -1 to 9) so the game knows what to display.  1 to 9 are levels, -1 is the menu, and 0 is 
var levelselect = false;		//boolean, stores whether the user is in the Level Selection Menu or not
var gamestart = false;			//allows the lander to move, and activates game timers etc

var fuel = 5000;				//The amount of fuel
var score = 0;					//The player's score for the current level
var bonus = 0;					//Adds to the score, extra if they crash and 
var gravity = 0;				//Stores the gravity value for each level
var freeflightgravity = 0;		//Stores the value from the prompt at the start of free flight so the user can pick a gravity value
var gameTimer = 0;				//Increments once a second

var tempname;					//Temporarily stores the name to remove the & character
var tempname2;					//Temporarily stores the name to remove the ' character
var tempname3;					//Temporarily stores the name to cut it down to 30 characters long
var playername;					//Stores the value from the prompt at the start of the game so the user can pick their own username

//read mouse x and y position
canvas.addEventListener("mousedown", doMouseDown, false);
function doMouseDown(event){
    canvas_x = event.pageX;
    canvas_y = event.pageY;

    //read keys
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
}

//Draw a background and then ask the player for a username
ctx.drawImage(space, 0, 0, canvas.width, canvas.height);
tempname = prompt("Please enter your name (for highscores)", "Unnamed Astronaut");
tempname2 = tempname.replace(/&/g, "and");
tempname3 = tempname2.replace(/'/g, '"');
playername = tempname3.substring(0,30);
if (playername == null){
    playername = "Unnamed Astronaut";
}

//Makes the alert appear when the instructions button in HTML (below the canvas on screen, above the <script> in code) is pressed
function instructions(){
        // \n for a new line in the text, extra lines are concatenated on the end with "+"
        alert("Choose your name, then click start, then click on the planet/moon you want to go to or press a number from 1 to 8\n\n"+
        "Arrow keys or WASD to move\nT to toggle force arrow visibility\nR to restart\nM to go to the menu screen\nNever gonna press Q key\n"+
        "In free flight mode you can press '+' or '-' to increase or decrease the gravity\n\n"+
        "Remember to land the lander gently\nLand on the blue landing zone for extra points\nDon't let your fuel get to 0, or you'll crash!\n\n"+
        "Go to      https://doc.co/ys85jg      for the User Guide\n\n");
}

//read when keys are pressed
function keyDownHandler(e) {
    if (crashed == false && landed == false && fuelout == false){
        //38 is up, 87 is w
        //UP
        if(e.keyCode == 38 || e.keyCode == 87) {
            upPressed = true;
        }
    
        //39 is right, 68 is d
        //RIGHT
        if(e.keyCode == 39 || e.keyCode == 68) {
            rightPressed = true;
            }
        //37 is left, 65 is a
        //LEFT
        if(e.keyCode == 37 || e.keyCode == 65) {
            leftPressed = true;
        }
        }
    if (levelnum == 0){
        //increase gravity (+key)
        if(e.keyCode == 107 || e.keyCode == 187 || e.keyCode == 61) {
            freeflightgravity++;
        }
        //decrease gravity (-key)
        if(e.keyCode == 109 ||  e.keyCode == 189 || e.keyCode == 173) {
            freeflightgravity--;
        }
    }
        
    //74 is j
    //DEBUG MODE
        if(e.keyCode == 74) {
            if (debugMode == true){
                debugMode = false;
            } else{
                debugMode = true;
            }
        }
    //82 is r	
    //Reset the game
    if(e.keyCode == 82) {
        x = 200;
        dx = 1;
        y = 200;
        dy = 1;
        fuel = 5000;
        landed = false;
        crashed = false;
        fuelout = false;
        gameTimer = 0;
        bonus = 0;
    }	
    
    //77 is m
    //Restart - go to menu (not restart the entire game)
    if(e.keyCode == 77) {
        gotoMenu();
    }	
    
    //84 is t
    //Toggle the force arrows
    if(e.keyCode == 84) {
        if (arrowvisible == true){
            arrowvisible = false;
        } else{
            arrowvisible = true;
        }
    }
    
    //13 is ENTER
    //Start the game (alternative to pressing start button)
    if(e.keyCode == 13) {
        levelselect = true;
    }
    
    //Press keyboard numbers rather than clicking buttons
    
    //49 is "1"
    //Go to Mercury
    if(e.keyCode == 49 && levelnum ==-1) {
        alert("You're going to land on Mercury\n"+
        "Mercury takes 88 days to orbit the sun\n"+
        "Closest planet to the sun\n"+
        "Named after the Roman messenger of the gods");
        levelnum = 1;
        gamestart = true;
    }
    //50 is "2"
    //Go to Venus
    if(e.keyCode == 50 && levelnum ==-1) {
        alert("You're going to land on Venus\n"+
        "Second closest planet to the sun\n"+
        "Similar size and mass to Earth\n"+
        "Dense atmosphere of 96% Carbon Dioxide");
        levelnum = 2;
        gamestart = true;
    }
    //51 is "3"
    //Go to Moon
    if(e.keyCode == 51 && levelnum ==-1) {
        alert("You're going to land on the Moon\n"+
        "1/4 of the size of the Earth\n"+
        "1/6 of Earth's gravity\n"+
        "It takes around 29 days for the Moon to orbit the Earth\n"+
        "Only 12 astronauts have ever been to the Moon");
        levelnum = 3;
        gamestart = true;
    }
    //52 is "4"
    //Go to Mars
    if(e.keyCode == 52 && levelnum ==-1) {
        alert("You're going to land on Mars\n"+
        "Named after the Roman god of war\n"+
        "Has a thin atmosphere\n"+
        "It is red because there is lots of iron on the surface");
        levelnum = 4;
        gamestart = true;
    }		
    //53 is "5"
    //Go to Ganymede
    if(e.keyCode == 53 && levelnum ==-1) {
        alert("You're going to land on Ganymede\n"+
        "Moon of Jupiter\n"+
        "Discovered in 1610 by Galileo\n"+
        "Named after a character from a Greek myth\n"+
        "Has a thin oxygen atmosphere\n"+
        "Jupiter has 67 moons\n"+
        "Jupiter is a gas giant");
        levelnum = 5;
        gamestart = true;
    }
    //54 is "6"
    //Go to Titan
    if(e.keyCode == 54 && levelnum ==-1) {
        alert("You're going to land on Titan\n"+
        "Moon of Saturn\n"+
        "Saturn has 62 moons\n"+
        "Saturn is a gas giant\n"+
        "Titan has methane as a solid, liquid and gas");
        levelnum = 6;
        gamestart = true;
    }
    //55 is "7"
    //Go to Uranus
    if(e.keyCode == 55 && levelnum ==-1) {
        alert("You're going to land on Uranus\n"+
        "Named after the Greek god of the sky\n"+
        "It takes 84 Earth years for Uranus to get around the sun");
        levelnum = 7;
        gamestart = true;
    }
    //56 is "8"
    //Go to Neptune
    if(e.keyCode == 56 && levelnum ==-1) {
        alert("You're going to land on Neptune\n"+
        "Named after the Roman God of the Sea\n"+
        "Discovered on 23rd September 1846");
        levelnum = 8;
        gamestart = true;
    }
    //57 is "9"
    //Go to Black Hole
    if(e.keyCode == 57 && levelnum ==-1) {
        alert("The gravity of a black hole is so high it even sucks in light!\n"+
        "The acceleration is really 6 * 10 ^16 m/s^2, but the game can't cope with this...");
        levelnum = 9;
        gamestart = true;
    }
        
    //81 is Q
    //RICKROLLING MODE
    if(e.keyCode == 81) {
        window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ","_blank");
        alert("Why would you even?");
    }
}

//read when keys are released
function keyUpHandler(e) {
    //38 is up, 87 is w
    if(e.keyCode == 38 ||e.keyCode == 87) {
        upPressed = false;
    }
    //39 is right, 68 is d
    if(e.keyCode == 39 ||e.keyCode == 68) {
        rightPressed = false;
    }
    //37 is left, 65 is a
    if(e.keyCode == 37 ||e.keyCode == 65) {
        leftPressed = false;
    }
}

//Draw the lander and the fire animation beneath the lander
//Gas bursts NOT drawn here, this is controlled by left/right pressed
function drawLander(){
    if (crashed == false){
        //Draw the lander's flame animation - three different images each drawn in turn
        if (fuelout == false){
            if (fireCount == 1){
                ctx.drawImage(fire1, x+21, y+55, 14, thrustCount);
                fireCount = 2;
            }else if(fireCount == 2){
                ctx.drawImage(fire2, x+21, y+55, 14, thrustCount);
                fireCount = 3;
            }else if(fireCount == 3){
                ctx.drawImage(fire3, x+21, y+55, 14, thrustCount);
                fireCount = 1;
            }
        }
        //Draw the lander
        //name, x position, y position, width, height
        ctx.drawImage(lander, x, y, 57, 60);
    }
}

//debug menu with useful information about the game for testing purposes
function drawDebug() {
    ctx.font = "11px monospace";
    ctx.fillStyle = "#777777";
    //text, x position, y position
    ctx.fillText("DEBUG MODE", 10, 15);
    ctx.fillText("upPressed: "+upPressed, 15, 30);
    ctx.fillText("leftPressed: "+leftPressed, 15, 45);
    ctx.fillText("rightPressed: "+rightPressed, 15, 60);
    ctx.fillText("x: "+x, 15, 75);
    ctx.fillText("dx: "+dx, 15, 90);
    ctx.fillText("y: "+y, 15, 105);
    ctx.fillText("dy: "+dy, 15, 120);
    ctx.fillText("fuelout: "+fuelout, 15, 135);
    ctx.fillText("landed: "+landed, 15, 150);
    ctx.fillText("crashed: "+crashed, 15, 165);
    ctx.fillText("landedVelocityY: "+landedVelocityY, 15, 180);
    ctx.fillText("landedVelocityX: "+landedVelocityX, 15, 195);
    ctx.fillText("thrustArrow: "+thrustArrow, 15, 210);
    if (thrustArrow > gravity){
        ctx.fillText("Thrust is greater than gravity", 15, 225);
    }else{
        ctx.fillText("Thrust less than gravity", 15, 225);
    }
    ctx.fillText("MouseX = " + canvas_x, 15, 240);
    ctx.fillText("MouseY = " + canvas_y, 15, 255);
    ctx.fillText("WindowHeight = " + window.innerHeight, 15, 270);
    ctx.fillText("WindowWidth = " + window.innerWidth, 15, 285);
    ctx.fillText("levelnum = " + levelnum, 15, 300);
    ctx.fillText("fuel= " + fuel, 15, 315);
    ctx.fillText("shadowsize= " + shadowsize, 15, 330);
}	

//Draw the crashed lander and the "You Crashed" message when the lander crashes
function drawCrashed(){
    if (levelnum != 9){
        ctx.font = "30px Molengo";
        ctx.fillStyle = "#FF0000";
        ctx.fillText("You Crashed", x - 50, y - 25);
        ctx.drawImage(landercrash, x, y, 56, 60);
    }
    else{
        //draw flat image if you crash in the black hole
        ctx.drawImage(landerblackhole, x, y, 56, 60);
    }
}
//Draw the "You Landed" message when the lander lands
function drawLanded(){
    ctx.font = "30px Molengo";
    ctx.fillStyle = "#00FF00";
    ctx.fillText("You Landed", x - 50, y - 25);
}


//Draw the shadow of the lander on the ground underneath the lander
function drawShadow(){
    shadowsize = (y/11);
    //x size is roughly double y size, hence shadowsize is halved for y
    ctx.drawImage(landershadow, x+2, canvas.height-25, shadowsize, (shadowsize/2.25));
}

//draw the background, a different ground and the bonus zone for each level
function drawBackground(){
    ctx.drawImage(space, 0, 0, canvas.width, canvas.height);
    switch(levelnum){
        case 0:
            //Free Flight
            ctx.drawImage(freeflightground, 0,canvas.height-25,canvas.width,25);
            break;
        case 1:
            //Mercury
            ctx.drawImage(mercuryground, 0,canvas.height-25,canvas.width,25);
            break;
        case 2:
            //Venus
            ctx.drawImage(venusground, 0,canvas.height-25,canvas.width,25);
            break;
        case 3:
            //Moon
            ctx.drawImage(moonground, 0,canvas.height-25,canvas.width,25);
            break;
        case 4:
            //Mars
            ctx.drawImage(marsground, 0,canvas.height-25,canvas.width,25);
            break;
        case 5:
            //Ganymede
            ctx.drawImage(ganymedeground, 0,canvas.height-25,canvas.width,25);
            break;
        case 6:
            //Titan
            ctx.drawImage(titanground, 0,canvas.height-25,canvas.width,25);
            break;
        case 7:
            //Uranus
            ctx.drawImage(uranusground, 0,canvas.height-25,canvas.width,25);
            break;
        case 8:
            //Neptune
            ctx.drawImage(neptuneground, 0,canvas.height-25,canvas.width,25);
            break;
        case 9:
            //Black Hole
            break;
        default:
            //Not recognised
            ctx.drawImage(freeflightground, 0,canvas.height-25,canvas.width,25);
            break;
    }
    //bonus landing area
    if (levelnum != 0 && levelnum != 9){
        ctx.fillStyle = "#00F";
        ctx.fillRect(800,(canvas.height/2)+300, 100, 10);
    }
}

//Draw the stats in the top right of the screen
function drawUI(){
    //This part calculates the score
    score = (fuel + (500*gravity)) - (gameTimer*100)+bonus;
    
    //This part draws the UI (text in top right)
    ctx.font = "20px Molengo";
    ctx.fillStyle = "#9999FF";	
    //while not in black hole mode
    if (levelnum !=9){
        ctx.fillText("Gravity: "+ gravity+ "m/s\u00B2", canvas.width - 150, 60);
    }
    else{
        ctx.fillText("Gravity: X m/s\u00B2", canvas.width - 150, 60);
    }
    ctx.fillText("Time taken: "+ gameTimer, canvas.width - 150, 90);
    //Only display these when not in freeflight mode
    if (levelnum !=0){
        ctx.fillText("Fuel: " + fuel, canvas.width - 150, 120);
        
        //draw the fuel bar
            //fuel background
                ctx.beginPath();
                ctx.rect(canvas.width - 155, 130, 110, 15);
                ctx.fillStyle = "#333";
                ctx.fill();
                ctx.closePath();
            //glass container of fuel liquid
                ctx.beginPath();
                ctx.rect(canvas.width - 150, 135, 100, 5);
                ctx.fillStyle = "#777";
                ctx.fill();
                ctx.closePath();
            //fuel level
                ctx.beginPath();
                ctx.rect(canvas.width - 150, 135, fuel/50, 5);
                ctx.fillStyle = "#990";
                ctx.fill();
                ctx.closePath();
        
        //set the colour back to before so text below still looks normal
        ctx.fillStyle = "#9999FF";	
        ctx.fillText("Score: " + score, canvas.width - 150, 200);
        if (fuel<1000 && fuel >0){
            ctx.fillStyle = "#FF0000";
            ctx.fillText("LOW FUEL", canvas.width - 150, 165);
        }
        if (fuel == 0){
            ctx.fillStyle = "#FF0000";
            ctx.fillText("NO FUEL!", canvas.width - 150, 165);
        }
    }
    //Find the planet name to use from the levelnum
    //Also pick the gravity value (m/s^2)
    //Mercury, Venus, Moon, Mars, Ganymede, Titan, Uranus, Neptune
    //Add small extra bit to UI if on moon
    switch(levelnum){
        case 0:
            planetname = "Free Flight";
            gravity = freeflightgravity;
            //Normal gravity
            break;
        case 1:
            planetname = "Mercury";
            gravity = 3.7;
            break;
        case 2:
            planetname = "Venus";
            gravity = 8.9;
            break;
        case 3:
            planetname = "The Moon";
            ctx.fillStyle = "#9999FF";
            ctx.fillText("Moon of Earth", 800, 30);
            gravity = 1.6;
            break;
        case 4:
            planetname = "Mars";
            gravity = 3.7;
            break;
        case 5:
            planetname = "Ganymede";
            ctx.fillText("Moon of Jupiter", 800, 30);
            gravity = 1.4;
            break;
        case 6:
            planetname = "Titan";
            ctx.fillText("Moon of Saturn", 800, 30);
            gravity = 1.4;
            break;
        case 7:
            planetname = "Uranus";
            gravity = 8.7;
            break;
        case 8:
            planetname = "Neptune";
            gravity = 11.2;
            break;
        case 9:
            planetname = "Black Hole";
            gravity = 50;
            break;
        default:
            //Not Recognised
            planetname = "?";
            gravity = 5;
            break;
    }
    ctx.fillStyle = "#33FF33";
    ctx.font = "bold 20px Molengo";
    ctx.fillText(planetname, canvas.width - 150, 30);
}

//Create the level select screen, with different planet, background, buttons, and make all elements clickable
function drawLevelSelect(){
//Level Numbers:
//-1 = no level selected
// 0 = free flight
// 1 = Mercury
// 2 = Venus
// 3 = Moon

    //Background
        ctx.drawImage(orbits, 0, 0, canvas.width, canvas.height);
    
    //Planets
    ctx.font = "15px Molengo";
    ctx.fillStyle = "#00FF00";
        //Mercury
        ctx.fillText("Mercury", 685, 275);
        ctx.drawImage(mercury, (canvas.width/2)+123, (canvas.height/2)-40, 15, 15);
        //Venus
        ctx.fillText("Venus", 780, 295);
        ctx.drawImage(venus, (canvas.width/2)+200, (canvas.height/2)-20, 25, 25);
        //Moon
        ctx.fillText("Moon", 860, 340);
        ctx.drawImage(moon, (canvas.width/2)+290, (canvas.height/2)+22, 10, 10);
        
    //No Fly Planets
    ctx.font = "12px Molengo";
    ctx.fillStyle = "#FF0000";
        //Earth
        ctx.fillText("Earth", 825, 335);
        ctx.drawImage(earth, (canvas.width/2)+260, (canvas.height/2)+20, 25, 25);
    
    //Free Flight
        ctx.fillStyle = "#00AA00";
        //half way, minus half of the x and y of the shape size
        ctx.fillRect((canvas.width/2)+315,(canvas.height/2)+215, 200, 50);
        ctx.font = "30px Molengo";
        ctx.fillStyle = "#FFFF00";
        ctx.fillText("Free Flight", (canvas.width/2)+350,(canvas.height/2)+250);
        
    //Instructions
        ctx.fillStyle = "#00AA00";
        //half way, minus half of the x and y of the shape size
        ctx.fillRect((canvas.width/2)-515,(canvas.height/2)+215, 200, 50);
        ctx.font = "30px Molengo";
        ctx.fillStyle = "#FFFF00";
        ctx.fillText("How to Play", (canvas.width/2)-490,(canvas.height/2)+250);
        
    ctx.font = "15px Molengo";
    ctx.fillStyle = "#FFFF00";
    ctx.fillText("Press number keys 1 to 8 to pick your planet or moon", (canvas.width/2)-150,(canvas.height/2)-250);
        
        
        //This uses the size of the canvas for y axis, and size of window for x axis (as the canvas is centralised)
        //This controls the button for the instructions
            if (canvas_x > (window.innerWidth/2)-515 && canvas_x < (window.innerWidth/2)-315 && canvas_y > (canvas.height/2)+245 && canvas_y < (canvas.height/2)+295){
                // \n for a new line in the text, "+" for concatentation to get over multiple line problem
                alert("Click on the planet/moon you want to go to or press a number from 1 to 8\n\n"+
                "Arrow keys or WASD to move\nT to toggle force arrow visibility\nR to restart\nM to go to the menu screen\nNever gonna press Q key\n\n"+
                "In free flight mode you can press '+' or '-' to increase or decrease the gravity\n\n"+
                "Remember to land the lander gently\nLand on the blue landing zone for extra points\nDon't let your fuel get to 0, or you'll crash!\n\n"+
                "If you accidentially tick 'Do not show alerts', then you must close the tab and then reopen it");
                canvas_x=0; //This is because you want to return to the menu afterwards, otherwise it thinks you keep clicking the button whenever you return					
        
        //This controls the button to enter free flight mode
            }else if (canvas_x > (window.innerWidth/2)+315 && canvas_x < (window.innerWidth/2)+515 && canvas_y > (canvas.height/2)+245 && canvas_y < (canvas.height/2)+295){
                levelnum = 0;
                gamestart = true;
                freeflightgravity = prompt("Enter how much gravity you want.  Try numbers between 0 and 50 to see what happens!", "10");
                //control the errors and error correction for this value
                    if (isNaN(freeflightgravity) == true ) {
                            gamestart = false;
                            alert("Please only enter numbers for the gravity value!");
                    }else if(freeflightgravity>50){
                        gamestart = false;
                        alert("Please enter numbers less than 50 for the gravity value!");				
                    }else if(freeflightgravity<0){
                        gamestart = false;
                        alert("Please enter positive numbers for the gravity value!");					
                    }else if(freeflightgravity == ""){
                        freeflightgravity = 0;	
                    }else if(freeflightgravity == null){
                        gamestart = false;
                        canvas_x = 0;
                    }
        //This controls the Sun
            //This forms a rough square in the Sun area, THIS IS NOT PERFECT!
            //y = 100px, x = 100px
            }else if (canvas_x > (window.innerWidth/2)-50 && canvas_x < (window.innerWidth/2)+50 && canvas_y > (canvas.height/2)-25 && canvas_y < (canvas.height/2)+75){
                alert("You wanted to land on the Sun\nExcept you can't, because it's way too hot there...\nThe sun is a star\nThe sun uses nuclear fusion to turn hydrogen into helium");
                canvas_x=0; //This is because you want to return to the menu afterwards, otherwise it thinks you keep clicking the button whenever you return	

        //This controls Mercury
            }else if (canvas_x > (window.innerWidth/2)+123 && canvas_x < (window.innerWidth/2)+138 && canvas_y > (canvas.height/2)-15 && canvas_y < (canvas.height/2)-0){
                alert("You're going to land on Mercury\n"+
                "Mercury takes 88 days to orbit the sun\n"+
                "Closest planet to the sun\n"+
                "Named after the Roman messenger of the gods");
                levelnum = 1;
                gamestart = true;
                
        //This controls Venus
            //Not really sure why the y values are exactly as they are, but it wouldn't work any other way...
            }else if (canvas_x > (window.innerWidth/2)+200 && canvas_x < (window.innerWidth/2)+225 && canvas_y > (canvas.height/2)+10 && canvas_y < (canvas.height/2)+35){
                alert("You're going to land on Venus\n"+
                "Second closest planet to the sun\n"+
                "Similar size and mass to Earth\n"+
                "Dense atmosphere of 96% Carbon Dioxide");
                levelnum = 2;
                gamestart = true;
            
        //This controls Earth/Moon
            //Not really sure why the y values are exactly as they are, but it wouldn't work any other way...
            }else if (canvas_x > (window.innerWidth/2)+260 && canvas_x < (window.innerWidth/2)+300 && canvas_y > (canvas.height/2)+50 && canvas_y < (canvas.height/2)+75){
                    alert("You're going to land on the Moon\n"+
                    "1/4 of the size of the Earth\n"+
                    "1/6 of Earth's gravity\n"+
                    "It takes around 29 days for the Moon to orbit the Earth\n"+
                    "Only 12 astronauts have ever been to the Moon");
                levelnum = 3;
                gamestart = true;
                
        //This controls the black hole!
            //Will appear in top left corner
            }else if (canvas_x > (window.innerWidth/2)-568 && canvas_x < (window.innerWidth/2)-468 && canvas_y > 0 && canvas_y < 100){
                alert("The gravity of a black hole is so high it even sucks in light!\n The gravity is really 6 * 10 ^16 m/s^2, but the game can't cope with this...");
                levelnum = 9;
                gamestart = true;		
                
        //When a button isn't pressed
            }else{
                levelnum = -1;
                gamestart = false;
            }
}

//This draws the very first screen when you start the game
function drawFirstScreen(){
    ctx.drawImage(titleart, 0, 0, canvas.width, canvas.height);
    
    //Player name in the bottom right
    ctx.font = "20px Molengo";
    ctx.fillStyle = "#9999FF";			
    ctx.fillText("Hi there " + playername +"!", 30, canvas.height - 30);
    
    ctx.fillStyle = "#00AA00";
    //half way, minus half of the x and y of the shape size
    ctx.fillRect((canvas.width/2)-125,(canvas.height/2)+110, 250 ,75);
    ctx.font = "50px Molengo";
    ctx.fillStyle = "#FFFF00";
    ctx.fillText("START", (canvas.width/2)-70,(canvas.height/2)+165);
    //This uses the size of the canvas for y axis, and size of window for x axis (as the canvas is centralised)
    //This could be rewritten to be more like the level select code, but there is no real advantage to this (Unless you need to add more buttons, in which case it would be essential)
    if (canvas_x < (window.innerWidth/2)-125 || canvas_x > (window.innerWidth/2)+125 || canvas_y < (canvas.height/2)+135 || canvas_y > (canvas.height/2)+210){
        levelselect = false;
    }
    else{
        levelselect = true;
    }
}

//modified values to send them off to the PHP so it can be read by MySQL
function sendScores(){
    if (landed == false){
        landedstore = 0;
    }else if (landed == true && bonus == 5000){
        landedstore = 2;
    }else{
        landedstore = 1;
    }
    //send the score and other info to PHP in the URL so it can go to the MySQL database
    window.location.href = "highscores.php?pn="+playername+"&ln="+levelnum+"&s="+score+"&l="+landedstore;
    //Go back to the menu after 0.5 seconds - this is only useful in Firefox so that when you press back to go to the game menu.  Chrome
    setTimeout(gotoMenu, 500);
}

//Resets the game and sends you to the menu screen
function gotoMenu(){
    x = 200;
    dx = 1;
    y = 200;
    dy = 1;
    fuel = 5000;
    landed = false;
    crashed = false;
    fuelout = false;
    gameTimer = 0;
    canvas_x=0;	
    gamestart = false;
    levelselect = true;
    bonus = 0;
    score = 0;
}

//Calculate values for and draw the force arrows in the game
function drawForces(){
    //Thrust
        if (upPressed == true && thrustCount<80 ){
            thrustCount += 0.5;
        } else if (thrustCount>1){
            thrustCount -= 0.5;
        }
    
    if (arrowvisible == true){
        //Gravitational Potential Energy
        //4.15 is basically just the number that worked so that the arrows are the right lengths to show the forces correctly
        if (gravity>0){
            ctx.drawImage(bluedownarrow, x-10, y, 9, (gravity*4.15));
        }
        else{
            ctx.drawImage(blueuparrow, x-10, y, 9, -(gravity*4.15));
        }
        
        thrustArrow = thrustCount;
        ctx.drawImage(reduparrow, x-20, y,9,thrustArrow );
        
        //Left
        leftArrow = (-dx) *10;
        if (dx>0){
            leftArrow = 0;
        }
        ctx.drawImage(greenleftarrow, x, y-20, leftArrow,9 );
        
        //Right
        rightArrow = dx*10;
        if (dx<0){
            rightArrow = 0;
        }				
        ctx.drawImage(greenrightarrow, x, y-20, rightArrow,9 );
    }
}

//main part, calls all the other functions (this is itself called every 10ms)
function draw(){
    //clear canvas so everything appears to move rather 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    //run these functions	
    drawBackground();
    if (gamestart == false && levelselect == false){
        //when gamestart and menuselect are both false you must be in start menu
        drawFirstScreen();				
    }else if (gamestart == false && levelselect ==true){
        //must be in menuselect
        drawLevelSelect();
    }else{
        //must be in game, so draw shadow, lander, forces, UI etc
        drawShadow();
        drawForces();
        drawLander();
        drawUI();
        if (crashed == true){
            drawCrashed();
        }
        if (landed == true){
            drawLanded();
        }
    }
    if (debugMode == true){
        drawDebug();
    }
    
    //Stop when the lander hits left/right
    if(x + dx > canvas.width - 56 || x + dx < 0) {
        dx = 0;
    }
    //Stop when the lander hits the top
    if(y + dy < 0){
        dy = 0;
    }
    //Stop when the lander hits the bottom
    if(y + dy > (canvas.height-60)-15){
        if (landed == false && crashed == false && levelnum !=0){
            landedVelocityY = dy;
            landedVelocityX = dx;
            
            //if going faster than 0.4 in y then crash, otherwise land
            //if going faster that 0.4 or -0.4 in x then crash, otherwise land
                if (levelnum == 9){
                    //lose 70000 points in black hole mode so it doesn't affect the high scores
                    crashed = true;
                    bonus = -70000;
                }else if (landedVelocityY > 0.4 || landedVelocityX > 0.4 || landedVelocityX < -0.4){
                    //lose 5000 points if you crash
                    crashed = true;
                    bonus = -5000;
                }
                else{
                    //bonus of 2500 points for landing
                    landed = true;
                    bonus = 2500;
                    //(57 is the width of the lander)
                    if (x>800 && x<(900-57)){
                        //bonus of 5000 points for landing in the bonus area
                        bonus = 5000;
                    }
                }
                //disable controls after you hit the ground
                rightPressed = false;
                upPressed = false;
                leftPressed = false;

                //Go to the high scores after 2 seconds
                setTimeout(sendScores, 2000);

        }
        dy = 0;
        dx = dx /1.05;  //this line is friction
    }
        
    
    //X and Y acceleration controls
    x += dx;
    y += dy;
    
    //Keyboard to lander direction/acceleration
    if(rightPressed && leftPressed){
        //forces cancel so nothing happens!
        ctx.drawImage(gasright, x-12, y+5, 20, 10);
        ctx.drawImage(gasleft, x+49, y+5, 20, 10);
        fuel -= 2;
    }
    else if(rightPressed) {
        //move right and draw left gas burst
        ctx.drawImage(gasright, x-12, y+5, 20, 10);
        dx += 0.01;
        fuel -= 1;
    }
    else if(leftPressed) {
        //move left and draw right gas burst
        ctx.drawImage(gasleft, x+49, y+5, 20, 10);
        dx -= 0.01;
        fuel -= 1;
    }
    if(upPressed) {
        //move up
        dy -= 0.02;
        fuel -= 3;
    }
        //This is not an if so it happens all the time
        //this means the lander is pulled down by gravity
        dy += gravity/1000;
    if(fuel<1 && levelnum != 0){
        fuel = 0;
        fuelout = true;
        rightPressed = false;
        upPressed = false;
        leftPressed = false;
    }
    
    if (gamestart == false || levelselect == false){
        x = 200;
        dx = 1;
        y = 200;
        dy = 1;
    }
    //redraw each part of the canvas when necessary
    //could reimplement this, but it didn't work very well in VM at the time
    //requestAnimationFrame(draw);
}
//draw();	

function time(){
    //while the game is being played (no crash/landing) timer is incremented
    if (gamestart == true && crashed == false && landed == false){
        gameTimer ++;
    }
}
//call this every 1 second to increment the timer
setInterval(time, 1000);
//call this every 10 milliseconds to draw a new frame in the game
setInterval(draw, 10);