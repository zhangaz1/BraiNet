<? 
    $nodeKey = $_POST['nodeKey'];
    $nodeName = $_POST['nodeName'];										/*string*/
    $userID = $_POST['userID'];											/*int*/
    $notes = $_POST['notes']; 
    $isClone = $_POST['isClone'];          								/*string*/
    $origin = $_POST['origin'];
    
    $con = mysql_connect("localhost", "tacitia_brainIDC", "Ophelia621");
    if (!$con) {
        die('Could not connect: ' . mysql_error());
    }

    mysql_select_db("brainconnect_brainData", $con);

    $nodeName = mysql_real_escape_string($nodeName);
    $notes = mysql_real_escape_string($notes);
    
    if ($isClone) {
    	if ($nodeName) {
    		mysql_query("INSERT INTO diff_nodes (nodeKey, diff, userID, origin, content) VALUES ('$nodeKey', 'Rename', '$userID', '$origin', '$nodeName')") or die("an error occurred when updating node name" . mysql_error());
    	}
    	if ($notes) {
			mysql_query("INSERT INTO diff_nodes (nodeKey, diff, userID, origin, content) VALUES ('$nodeKey', 'ChangeNote', '$userID', '$origin', '$notes')") or die("an error occurred when updating node notes" . mysql_error());
    	}
    }
    else {
    	if ($nodeName) {
    		mysql_query("UPDATE user_nodes SET `name` = '$nodeName' WHERE `key` = '$nodeKey'") or die("an error occurred when updating node name" . mysql_error());
    	}
    	if ($notes) {
			mysql_query("UPDATE user_nodes SET `notes` = '$notes' WHERE `key` = '$nodeKey'") or die("an error occurred when updating node notes" . mysql_error());
    	}
    }
    
	mysql_close($con);
?>
