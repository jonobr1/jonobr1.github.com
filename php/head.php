
<?

  /**
   * Preprocessing.
   */

  if (!$root && $debug) {
    $root = './';
  } else if (!$debug) {
    $root = 'http://jonobr1.com/';
  }

?>

<!doctype html>
<html>
  <head>

    <title>jonobr1 : <? echo $title; ?></title>

    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="ROBOTS" content="INDEX,FOLLOW">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta charset="utf-8">
    <meta name="description" content="jonobr1: work, ideas, findings.">
    <meta property="og:url" content="http://jonobr1.com">
    <meta property="og:site_name" content="jonobr1 : <? echo $title; ?>">

    <link rel="stylesheet" type="text/css" href="<? echo $root ?>styles/base.css" />
    <link rel="shortcut icon" type="image/png" href="<? echo $root ?>images/favicon.png" />

    <!-- Other import scripts -->

    <script type="text/javascript" src="<? echo $root; ?>third-party/prettify/prettify.js"></script>
    <script type="text/javascript" src="<? echo $root; ?>third-party/jquery-1.7.1.min.js"></script>
    <script type="text/javascript" src="<?echo $root; ?>third-party/marked.js"></script>

    <?

      include $root . "php/fragments/topbar.php";

    ?>

  </head>
  <body>
    <nav>
      <ul>
        <li class="first">
          <a id="home-button" href="http://jonobr1.com/">
            <svg id="logo" width="140" height="140" style="margin: -30px;">
              <g transform="translate(30 30)">
                <!-- br -->
                <path fill="#333333" d="M40,3c20.402,0,37,16.598,37,37c0,20.402-16.598,37-37,37C19.598,77,3,60.402,3,40C3,19.598,19.598,3,40,3
                   M40,0C17.909,0,0,17.909,0,40c0,22.092,17.909,40,40,40c22.092,0,40-17.908,40-40C80,17.909,62.092,0,40,0L40,0z"/>
                <!-- 1 -->
                <polyline fill="none" stroke="#333332" stroke-width="4" stroke-linejoin="round" stroke-miterlimit="10" points="62.121,31.732
                  62.121,23.372 59.572,26.521 "/>
                <!-- Outer circle -->
                <path fill="none" stroke="#333333" stroke-width="4" stroke-miterlimit="10" d="M17.23,44.615c0.631-0.766,4.511-7.198,10.152-8.902c5.643-1.704,9.605-0.266,11.008,5.266s-0.564,13.702-6.426,14.666s-7.045-4.89-5.484-8.373c1.562-3.482,4.615-4.228,7.962-3.854c2.341,0.26,4.782,2.372,7.553,1.253s2.753-4.586,2.753-4.586l6.487-2.048c0,3.93,1.292,9.755,5.243,11.334c3.953,1.577,5.685-1.687,5.685-3.83 M19.034,26.49c-0.458,7.256,0.502,22.597,1.991,31.188"/>
              </g>
            </svg>
          </a>
        </li>
        <li>
          <a href="http://works.jonobr1.com/">works</a>
          <a href="http://about.jonobr1.com/">about</a>
        </li>
        <li>
          <!-- <a href="http://process.jonobr1.com/">process</a> -->
          <a href="http://inspiration.jonobr1.com/">inspiration</a>
        </li>
        <li>
          <form id="subscribe" action="http://freelancerepublic.createsend.com/t/r/s/xdhdhj/" method="post">
            <input id="xdhdhj-xdhdhj" name="cm-xdhdhj-xdhdhj" type="text" value="" placeholder="mailing list" tabindex="1" autocomplete="off" />
            <input type="submit" value="&crarr;" tabindex="2" />
          </form>
        </li>
        <br class="clear" />
      </ul>
    </nav>
    <div id="container">
      <div id="content">
