# Fully-functional Web-Based Crossword Application
**Dynamic Crossword Puzzles**

Project follows loose Model-View-Controller design and meets WCAG 2.0 compliance standards.

Back end:
- Back end includes a crossword generator and communication logic with three databases. 
- Database design for word/definition retrieval db, testing db, and saving user state db.
- Includes API routing files andtwo suites of unit & integration tests. 
  
Front end:
- Front end includes six Angular components (& corresponding HTML files).
- Each component funnels game logic through Orchestration.js, which disperses game logic to a layer of services according to specific the request. 
- Includes implementation of a tutorial and supporting CSS files.
- Many supporting files/autoloaders/etc have been removed for clarity.
