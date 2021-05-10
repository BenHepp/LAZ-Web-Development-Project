CREATE DATABASE IF NOT EXISTS crossword_game;

CREATE TABLE IF NOT EXISTS crossword_game.incomplete_crossword (
  PRIMARY KEY incomplete_crossword_id INT AUTO_INCREMENT,
  example_student_id INT NOT NULL,
  crossword JSON NOT NULL,
  answer_key JSON NOT NULL
  );

CREATE TABLE IF NOT EXISTS crossword_game.finished_crossword (
  PRIMARY KEY finished_crossword_id INT AUTO_INCREMENT,
  completed_at DATETIME NOT NULL,
  example_student_id INT NOT NULL,
  crossword JSON NOT NULL
  );

CREATE INDEX example_student_id_answer_key on crossword_game.answer_key(example_student_id);
CREATE INDEX example_student_id_incomplete_crossword on crossword_game.incomplete_crossword(example_student_id);
CREATE INDEX example_student_id_finished_crossword on crossword_game.finished_crossword(example_student_id);
