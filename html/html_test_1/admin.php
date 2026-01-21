<?php
session_start();

// Database connection details
$host = 'localhost';
$dbname = 'olevelcc_quiz_db';
$username = 'olevelcc_olevel123';
$password = 'o^w@hRGZcs#A';

$admin_username = "admin";
$admin_password = "admin123";

if (!isset($_SESSION['admin_logged_in'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if ($_POST['username'] === $admin_username && $_POST['password'] === $admin_password) {
            $_SESSION['admin_logged_in'] = true;
        } else {
            $error_message = "Invalid credentials!";
        }
    }
}

function getQuizResults($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM quiz_results ORDER BY test_date DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
        return [];
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>O-Level Test Admin Dashboard</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #3498db;
            --success-color: #2ecc71;
            --danger-color: #e74c3c;
            --warning-color: #f1c40f;
            --light-color: #ecf0f1;
            --dark-color: #2c3e50;
            --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            --transition: all 0.3s ease;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            padding: 20px;
            color: var(--dark-color);
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: var(--shadow);
            backdrop-filter: blur(10px);
        }

        .login-form {
            max-width: 400px;
            margin: 40px auto;
            padding: 30px;
            background: white;
            border-radius: 15px;
            box-shadow: var(--shadow);
            animation: slideUp 0.5s ease;
        }

        @keyframes slideUp {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--light-color);
        }

        h1 {
            color: var(--primary-color);
            font-size: 2rem;
            margin: 0;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: var(--dark-color);
            font-weight: 500;
        }

        .form-group input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid var(--light-color);
            border-radius: 8px;
            font-size: 1rem;
            transition: var(--transition);
        }

        .form-group input:focus {
            border-color: var(--secondary-color);
            outline: none;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .stats-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: var(--shadow);
            transition: var(--transition);
            position: relative;
            overflow: hidden;
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: var(--secondary-color);
        }

        .stat-card h3 {
            color: var(--dark-color);
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }

        .stat-card p {
            font-size: 2rem;
            font-weight: 700;
            color: var(--secondary-color);
            margin: 0;
        }

        .stat-card i {
            position: absolute;
            right: 20px;
            top: 20px;
            font-size: 2.5rem;
            opacity: 0.1;
        }

        .results-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: var(--shadow);
        }

        .results-table th,
        .results-table td {
            padding: 15px;
            text-align: left;
        }

        .results-table th {
            background: var(--primary-color);
            color: white;
            font-weight: 500;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 1px;
        }

        .results-table tr:nth-child(even) {
            background: #f8f9fa;
        }

        .results-table tr:hover {
            background: #f1f4f6;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: var(--transition);
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 0.9rem;
        }

        .btn-primary {
            background: var(--secondary-color);
            color: white;
        }

        .btn-danger {
            background: var(--danger-color);
            color: white;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .error-message {
            background: #ffe5e5;
            color: var(--danger-color);
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .container {
                padding: 15px;
            }

            .stats-container {
                grid-template-columns: 1fr;
            }

            .results-table {
                display: block;
                overflow-x: auto;
                white-space: nowrap;
            }

            .dashboard-header {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }

            h1 {
                font-size: 1.5rem;
            }
        }

        @media (max-width: 480px) {
            body {
                padding: 10px;
            }

            .login-form {
                padding: 20px;
            }

            .stat-card {
                padding: 20px;
            }

            .stat-card p {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <?php if (!isset($_SESSION['admin_logged_in'])): ?>
            <div class="login-form">
                <h1><i class="fas fa-lock"></i> Admin Login</h1>
                <?php if (isset($error_message)): ?>
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i> <?php echo $error_message; ?>
                    </div>
                <?php endif; ?>
                <form method="POST" action="">
                    <div class="form-group">
                        <label for="username"><i class="fas fa-user"></i> Username</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password"><i class="fas fa-key"></i> Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                </form>
            </div>
        <?php else: ?>
            <div class="dashboard-header">
                <h1><i class="fas fa-chart-bar"></i> O-Level Test Results Dashboard</h1>
                <form method="POST" action="logout.php">
                    <button type="submit" class="btn btn-danger">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </form>
            </div>

            <?php
            try {
                $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                $results = getQuizResults($pdo);
                
                $total_participants = count($results);
                $average_score = $total_participants > 0 ? array_sum(array_column($results, 'score')) / $total_participants : 0;
                $highest_score = $total_participants > 0 ? max(array_column($results, 'score')) : 0;
                $lowest_score = $total_participants > 0 ? min(array_column($results, 'score')) : 0;
            ?>
                <div class="stats-container">
                    <div class="stat-card">
                        <i class="fas fa-users"></i>
                        <h3>Total Participants</h3>
                        <p><?php echo $total_participants; ?></p>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-chart-line"></i>
                        <h3>Average Score</h3>
                        <p><?php echo round($average_score, 1); ?>%</p>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-trophy"></i>
                        <h3>Highest Score</h3>
                        <p><?php echo $highest_score; ?>%</p>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-chart-bar"></i>
                        <h3>Lowest Score</h3>
                        <p><?php echo $lowest_score; ?>%</p>
                    </div>
                </div>

                <table class="results-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Score</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($results as $row): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($row['id']); ?></td>
                                <td><?php echo htmlspecialchars($row['username']); ?></td>
                                <td><?php echo htmlspecialchars($row['score']); ?>%</td>
                                <td><?php echo htmlspecialchars(date('M d, Y H:i', strtotime($row['test_date']))); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php
            } catch(PDOException $e) {
                echo "<div class='error-message'><i class='fas fa-exclamation-triangle'></i> Connection failed: " . $e->getMessage() . "</div>";
            }
            ?>
        <?php endif; ?>
    </div>
</body>
</html>