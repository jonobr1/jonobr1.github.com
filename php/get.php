<?

  $result = file_get_contents($_GET['q']);

  $result = json_decode($result);

  echo json_encode($result);

?>