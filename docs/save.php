<?php
  $html = file_get_contents('php://input');
  file_put_contents('index.html', $html);
?>
