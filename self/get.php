<?

  $result = file_get_contents($_GET['query']);

  $result = json_decode($result);

  echo json_encode($result->{'records'});

?>