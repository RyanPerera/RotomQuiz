###################################################################
FILTERING FOR QUESTIONS:

Base URL: api/filter

?difficulty (optional)= 1-10

?category (optional)= 
General
Main+Series
TCG
Anime%2FManga
VGC
Competitive
Mechanics
Stadium
Colo$2FXD
Mystery+Dungeon
Ranger
Rumble
Snap
Detective+Pikachu
Spinoffs
Collabs

?=generation (optional) = 
0 (All)
1-9
To select multiple, use %2C as delimiter

example queries:
api/filter/?difficulty=3&category=Main+Series&generation=0
api/filter/?difficulty=9
api/filter/?category=General
api/filter/?difficulty=4&generation=1%2C3%2C6

###################################################################
FILTERING FOR ANSWERS (based on questionId):

URL: api/answers/qId
returns all answers.

URL: api/answers/content/qId
returns id of answer and content only.

###################################################################
CHECK ANSWERS:

/api/answers/check/:id
returns value of 'correct' given an answer's ID.

###################################################################################################