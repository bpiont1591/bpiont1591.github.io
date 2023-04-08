<?php
if(isset($_POST['submit'])){
    // Ustawienia poczty
    $to = "piotrb99@icloud.com"; // adres e-mail, na który mają być przesyłane wiadomości
    $subject = "Formularz kontaktowy"; // temat wiadomości
    $headers = "From: " . $_POST['email'] . "\r\n"; // adres e-mail nadawcy

    // Treść wiadomości
    $message = "Imię i nazwisko: " . $_POST['name'] . "\r\n"
             . "E-mail: " . $_POST['email'] . "\r\n"
             . "Wiadomość: " . $_POST['message'];

    // Wysłanie wiadomości e-mail
    if(mail($to, $subject, $message, $headers)){
        echo "<p>Wiadomość została wysłana.</p>";
    } else {
        echo "<p>Wysłanie wiadomości nie powiodło się.</p>";
    }
}
?>