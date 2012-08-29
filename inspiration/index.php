<?

  // Page Settings

  $debug = true;
  $root = '../';
  $title = 'inspiration';

  include '../php/head.php';

?>

<link rel="stylesheet" type="text/css" media="screen" href="<? echo $root; ?>styles/inspiration.css" />

<!-- inspiration goes here -->

<!-- Development environment -->
<script type="text/javascript" src="<? echo $root; ?>src/js/inspiration.js"></script>

<!-- Built environment -->
<!-- <script type="text/javascript" src="<? echo $root; ?>src/build/inspiration.min.js"></script> -->

<?

  include '../php/foot.php';

?>