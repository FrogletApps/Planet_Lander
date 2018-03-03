<html>
    <head>
		<!--Title in the tab-->
		<title>Planet Lander</title>
		
		<!--So the browser knows what character set to use (gets rid of annoying Javascript error)-->
		<meta charset="UTF-8"> 
		
		<!--This makes the icon appear in the tab-->
		<link rel="icon" href="Resources/favicon.ico" type="image/ico">
		<link href='https://fonts.googleapis.com/css?family=Molengo' rel='stylesheet' type='text/css'>
		
		<!--CSS styling-->
        <link rel="stylesheet" type="text/css" href="style.css">
    </head>
    <body>
        <h1>Top 10 High Scores!</h1>
        <button onclick="goBack()" title="Click here to return back to the game">Back to Game</button>
        <button onclick="window.location.href='/scores.php'" title="Click here to see all the scores">All Scores</button>
        <?php
        //Connect to database
        $servername = "127.0.0.1";                              //localhost
        $username = "";                                         //
        $password = "";                                         //
        $dbname   = "planet_lander";                            //Your database name you want to connect to
        $port = ;
            
            $pn = $_GET["pn"];
            $ln = $_GET["ln"];
            $s = $_GET["s"];
            $l = $_GET["l"];
        
        //pn is the player's name
        //ln is level number
        //s is the score
        //l is boolean whether the lander landed (true) or not (false)

        // Create connection
            $conn = new mysqli($servername, $username, $password, $dbname, $port);

//CONNECTION CHECK
           if ($conn->connect_error) {
                 die("<p id='tiny'>Connection failed: " . $conn->connect_error . "</p>");
            }
            echo "<p id='tiny'>Connection to scores database successful!</p>";
        
             $sql = "INSERT INTO scores (Uname, Level, Time, Score, Landed) VALUES ('$pn', $ln, NOW(), $s, $l)";
             
//ADDING RECORDS CHECK             
           if(mysqli_query($conn, $sql)){
                echo "<p id='tiny'>Records added successfully.</p>";
           } else{
                echo "<p id='tiny'>ERROR: Could not able to execute $sql. " . mysqli_error($conn)."</p>";
           }
            
            //Get information from mySQL
            $sql = "SELECT id, Uname, Level, Time, Score, Landed FROM scores ORDER BY Score DESC, Landed DESC, Time DESC LIMIT 10";
            
            //Display information in HTML
            $result = mysqli_query($conn, $sql);
            
            echo "<br>";
            if ($l == 0){
                echo"<p>Better luck next time ".$pn.".  You scored ".$s." points.</p>";
            }else{
                echo"<p>Well done ".$pn."!  You scored ".$s." points.</p>";
            }
            
            echo "<table><tr id='title'><td>Rank</td><td>Username</td><td>Planet</td><td>Time</td><td>Score</td><td>Landed</td>";
                if (mysqli_num_rows($result) > 0) {
                    // output data of each row
                    while($row = mysqli_fetch_assoc($result)) {
                        echo "<tr id='scores'><td>" .$count++. "</td><td>" . $row["Uname"]. "</td><td>";
                        switch ($row["Level"]){
                            case 1;
                            echo "Mercury";
                            break;
                            case 2;
                            echo "Venus";
                            break;
                            case 3;
                            echo "Moon";
                            break;
                            case 4;
                            echo "Mars";
                            break;
                            case 5;
                            echo "Ganymede";
                            break;
                            case 6;
                            echo "Titan";
                            break; 
                            case 7;
                            echo "Uranus";
                            break;
                            case 8;
                            echo "Neptune";
                            break;   
                            case 9;
                            echo "Black Hole";
                            break;  
                            default;
                            echo "?";
                            break;
                        }
                        echo"</td><td>" . $row["Time"]. "</td><td>" . $row["Score"]. "</td><td>";
                        if ($row["Landed"] == 0){
                            echo "No</td></tr>";
                        }else if($row["Landed"] == 1){
                            echo "Yes</td><tr>";
                        }else if($row["Landed"] == 2){
                            echo "Bonus</td><tr>";
                        }else{
                            echo "?</td><tr>";
                        } 
                    }
                } else {
                    echo "<p>No scores found :c</p>";
                }

 // close connection
mysqli_close($conn);
        
?>
</table>
        <script>
            function goBack() {
                //Sends you back to the previous page when the button is clicked. 
                //Not ideal, but keeps the player "logged in" 
                window.history.back();
            }
        </script>
    </body>
</html>