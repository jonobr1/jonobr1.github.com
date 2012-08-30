<?

  if ($debug) {

    ?>

    <!-- Development Environment -->
    <script type="text/javascript" src="<? echo $root; ?>third-party/underscore.js"></script>
    <script type="text/javascript" src="<? echo $root; ?>third-party/require.js"></script>
    <script type="text/javascript">

      var base = "<? echo $root; ?>";

      require({
        baseUrl: base + 'src',
        paths: {
          'Physics': 'Physics/src/Physics',
          'Vector': 'Physics/src/Vector',
          'common': 'utils/common',
          'Attraction': 'Physics/src/Attraction',
          'Integrator': 'Physics/src/Integrator',
          'Particle': 'Physics/src/Particle',
          'ParticleSystem': 'Physics/src/ParticleSystem',
          'requestAnimationFrame': '../third-party/requestAnimationFrame',
          'Spring': 'Physics/src/Spring',
          'underscore': 'utils/empty'
        }
      });

    </script>
    <script type="text/javascript" src="<? echo $root; ?>src/js/topbar.js"></script>

    <?

  } else {

    ?>

    <script type="text/javascript" src="<? echo $root; ?>src/build/topbar.min.js"></script>

    <?

  }

?>