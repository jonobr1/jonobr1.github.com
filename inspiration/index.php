<?

  // Page Settings

  // $debug = true;
  $root = '../';
  $title = 'inspiration';

  include '../php/head.php';

?>

<link rel="stylesheet" type="text/css" media="screen" href="<? echo $root; ?>styles/inspiration.css" />

<div class="legend">
  <div class="metric">
    <p>
      <span>
        5 minutes
      </span>
    </p>
  </div>
</div>

<?

  if ($debug) {

    ?>

    <script type="text/javascript" src="<? echo $root; ?>src/js/inspiration.js"></script>

    <?

  } else {

    ?>

    <script type="text/javascript" src="<? echo $root; ?>src/build/inspiration.js"></script>

    <?

  }

?>

<?

  include '../php/foot.php';

?>