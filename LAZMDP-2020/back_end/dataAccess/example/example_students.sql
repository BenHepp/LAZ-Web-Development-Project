CREATE DATABASE IF NOT EXISTS example_students;
# Create example to demonstrate LAZ coding best practices

CREATE TABLE IF NOT EXISTS example_students.example_student (
  example_student_id int unsigned NOT NULL AUTO_INCREMENT,
  screen_name varchar(101) NOT NULL,
  student_first_name varchar(50) DEFAULT NULL,
  student_last_name varchar(50) DEFAULT NULL,
  password_text varchar(50) DEFAULT NULL,
  added_at datetime NOT NULL,
  removed_at datetime DEFAULT NULL,
  PRIMARY KEY (example_student_id),
  KEY removed_at (removed_at)
);
