<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['username'])) {
    $_SESSION['username'] = $_POST['username'];
    header("Location: quiz.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>O-Level Online Test Portal</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }

        body {
            min-height: 100vh;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            position: relative;
            overflow: hidden;
        }

        .academic-symbols {
            position: absolute;
            width: 100%;
            height: 100%;
            pointer-events: none;
            opacity: 0.1;
            z-index: 0;
        }

        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            position: relative;
            z-index: 1;
        }

        .header-badge {
            background: #ffffff;
            border-radius: 50%;
            width: 120px;
            height: 120px;
            margin: -80px auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .user-form {
            background: rgba(255, 255, 255, 0.97);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 60px 40px 40px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
            max-width: 550px;
            width: 100%;
            margin: 20px auto;
            position: relative;
            transform: translateY(0);
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        .user-form:hover {
            transform: translateY(-5px);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
        }

        .title-section {
            text-align: center;
            margin-bottom: 35px;
        }

        h2 {
            color: #1e3c72;
            font-size: 2.2rem;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .subtitle {
            color: #666;
            font-size: 1rem;
            margin-bottom: 20px;
        }

        .exam-info {
            background: rgba(30, 60, 114, 0.05);
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 25px;
            border-left: 4px solid #1e3c72;
        }

        .exam-info h3 {
            color: #1e3c72;
            font-size: 1.1rem;
            margin-bottom: 8px;
        }

        .exam-info ul {
            list-style: none;
            padding-left: 5px;
        }

        .exam-info li {
            color: #555;
            font-size: 0.9rem;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
        }

        .exam-info li i {
            color: #1e3c72;
            margin-right: 8px;
        }

        .form-group {
            margin-bottom: 25px;
            position: relative;
        }

        .form-group label {
            display: block;
            margin-bottom: 10px;
            color: #1e3c72;
            font-weight: 500;
            font-size: 1rem;
        }

        .form-group input {
            width: 100%;
            padding: 15px 20px;
            border: 2px solid rgba(30, 60, 114, 0.2);
            border-radius: 12px;
            font-size: 1rem;
            transition: all 0.3s ease;
            outline: none;
            background: rgba(255, 255, 255, 0.9);
        }

        .form-group input:focus {
            border-color: #1e3c72;
            box-shadow: 0 0 0 4px rgba(30, 60, 114, 0.1);
        }

        .start-btn {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-size: 1.1rem;
            font-weight: 600;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .start-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(30, 60, 114, 0.3);
        }

        .start-btn:active {
            transform: translateY(1px);
        }

        .start-btn i {
            transition: transform 0.3s ease;
        }

        .start-btn:hover i {
            transform: translateX(5px);
        }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        @media (max-width: 768px) {
            .user-form {
                padding: 40px 30px 30px;
            }

            h2 {
                font-size: 1.8rem;
            }

            .header-badge {
                width: 100px;
                height: 100px;
                margin-top: -50px;
            }
        }

        @media (max-width: 480px) {
            .user-form {
                padding: 30px 20px 20px;
            }

            h2 {
                font-size: 1.5rem;
            }

            .header-badge {
                width: 80px;
                height: 80px;
                margin-top: -40px;
            }

            .start-btn {
                padding: 15px;
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <!-- Academic Background Symbols -->
    <svg class="academic-symbols" viewBox="0 0 100 100" preserveAspectRatio="none">
        <text x="20" y="20" fill="#fff">∑</text>
        <text x="80" y="30" fill="#fff">π</text>
        <text x="40" y="50" fill="#fff">∫</text>
        <text x="70" y="70" fill="#fff">√</text>
        <text x="30" y="80" fill="#fff">α</text>
        <text x="60" y="40" fill="#fff">β</text>
    </svg>

    <div class="container">
        <div class="user-form">
            <!-- Header Badge with Icon -->
            <div class="header-badge">
                <svg width="50" height="50" viewBox="0 0 50 50">
                    <path d="M25 2 L48 13 L48 24 L25 35 L2 24 L2 13 Z" fill="#1e3c72"/>
                    <path d="M25 35 L48 24 L48 37 L25 48 L2 37 L2 24 Z" fill="#2a5298"/>
                    <circle cx="25" cy="20" r="5" fill="#fff"/>
                </svg>
            </div>

            <div class="title-section">
                <h2>O-Level Online Test</h2>
                <p class="subtitle">Basic HTML</p>
            </div>

            <div class="exam-info">
                <h3>Test Information</h3>
                <ul>
                    <li><i class="fas fa-clock"></i> Duration: 60 minutes</li>
                    <li><i class="fas fa-tasks"></i> Total Questions: 50</li>
                    <li><i class="fas fa-check-circle"></i> Passing Score: 25</li>
                </ul>
            </div>

            <form method="POST" action="">
                <div class="form-group">
                    <label for="username">
                        <i class="fas fa-user-graduate"></i> Candidate Name
                    </label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        required 
                        placeholder="Enter your full name "
                        autocomplete="off"
                        
                    >
                </div>
                <button type="submit" class="start-btn">
                    Start O-Level Test
                    <i class="fas fa-arrow-right"></i>
                </button>
            </form>
        </div>
    </div>
</body>
</html>