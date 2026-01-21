<?php
// save_result.php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'message' => 'No user session']);
    exit();
}

// Database connection details
$host = 'localhost';
$dbname = 'olevelcc_quiz_db';
$username = 'olevelcc_olevel123';     // Change to your database username
$password = 'o^w@hRGZcs#A';         // Change to your database password

try {
    // Create database connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get the POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Prepare and execute the insert statement
    $stmt = $pdo->prepare("INSERT INTO quiz_results (username, score) VALUES (?, ?)");
    $stmt->execute([
        $_SESSION['username'],
        $data['score']
    ]);

    echo json_encode(['success' => true]);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>