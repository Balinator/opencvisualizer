include = '#' 'include' '(<' includeName '(\.h)?' '>)'
includeName = '[a-zA-Z]*'

function = type functionIdentifier '\(' parameters '\)' functiionBody
type = '[a-zA-Z_]+'
functionIdentifier = '[a-zA-Z_][a-zA-Z_0-9]*'
parameters = '(' parameter '(' ',' parameter ')*)?'
parameter = type variableIdentifier
variableIdentifier = '[a-zA-Z_][a-zA-Z_0-9]*'
functiionBody = '({' '([^\r\n{}]*' '({' '([^\r\n{}]*' '({' '([^\r\n{}]*' '({' '([^\r\n{}]*' '({' '([^\r\n{}]*' '({' '([^\r\n{}]*' '({' '([^\r\n{}]*'  '[\r\n]*)*' '})?' '[\r\n]*)*' '})?' '[\r\n]*)*' '})?' '[\r\n]*)*' '})?' '[\r\n]*)*' '})?' '[\r\n]*)*' '})?' '[\r\n]*)*' '})'
// function body inner = '({' '([^\r\n{}]*'  '[\r\n]*)*' '})?'

NL = '[\r\n]*'
WS = '[ \t]*'
