CREATE DATABASE IF NOT EXISTS cs2Stats;

USE cs2Stats;

CREATE TABLE profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  steam_id VARCHAR(50) NOT NULL UNIQUE,
  username VARCHAR(100),
  kills INT DEFAULT 0,
  deaths INT DEFAULT 0,
  wins INT DEFAULT 0,
  rounds_played INT DEFAULT 0,
  headshots INT DEFAULT 0,
  time_played INT DEFAULT 0,
  mvps INT DEFAULT 0,
  awp_kills INT DEFAULT 0,
  ak47_kills INT DEFAULT 0,
  kd_ratio DECIMAL(10, 2) DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  headshot_rate DECIMAL(5, 2) DEFAULT 0,
  hours_played INT DEFAULT 0,
  raw_stats JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_steam_id (steam_id)
);