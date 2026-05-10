// Quick test of the pre-parser logic with the user's exact input

const rawInput = `Q1. What is the maximum length of a Python identifier?

Options:

32

16

128

No fixed length is specified.

Answer: No fixed length is specified.

Q2. What will be the output of the following code snippet?

Snippet:

Python
print(2**3 + (5+6)**(1+1))
Options:

129

8

121

None of the above.

Answer: 129

Q3. What will be the datatype of the var in the below code snippet?

Snippet:

Python
var = 10
print(type(var))
var = "Hello"
print(type(var))
Options:

str and int

int and int

str and str

int and str

Answer: int and str

Q4. How is a code block indicated in Python?

Options:

Brackets.

Indentation.

Key.

None of the above.

Answer: Indentation.

Q5. What will be the output of the following code snippet?

Snippet:

Python
a = [1, 2, 3]
a = tuple(a)
a[0] = 2
print(a)
Options:

[2, 2, 3]

(2, 2, 3)

(1, 2, 3)

Error.

Answer: Error. (Tuples are immutable in Python)

Q6. What will be the output of the following code snippet?

Snippet:

Python
print(type(5/2))
print(type(5//2))
Options:

float and int

int and float

float and float

int and int

Answer: float and int

Q7. What will be the output of the following code snippet?

Snippet:

Python
a = [1, 2, 3, 4, 5]
sum = 0
for ele in a:
    sum += ele
print(sum)
Options:

15

0

20

None of these

Answer: 15

Q8. What will be the output of the following code snippet?

Snippet:

Python
a = 3
b = 1
print(a, b)
a, b = b, a
print(a, b)
Options:

3 1 \\n 1 3

3 1 \\n 3 1

1 3 \\n 1 3

1 3 \\n 3 1

Answer: 3 1 \\n 1 3

Q9. What will be the output of the following code snippet?

Snippet:

Python
a = [1, 2]
print(a * 3)
Options:

Error

[1, 2]

[1, 2, 1, 2]

[1, 2, 1, 2, 1, 2]

Answer: [1, 2, 1, 2, 1, 2]

Q10. Which of the following types of loops are not supported in Python?

Options:

for

while

do-while

None of the above

Answer: do-while

Q11. What will be the output of the following code snippet?

Snippet:

Python
example = ["Sunday", "Monday", "Tuesday", "Wednesday"]
del example[2]
print(example)
Options:

['Sunday', 'Monday', 'Tuesday', 'Wednesday']

['Sunday', 'Monday', 'Wednesday']

['Monday', 'Tuesday', 'Wednesday']

['Sunday', 'Monday', 'Tuesday']

Answer: ['Sunday', 'Monday', 'Wednesday']

Q12. Which of the following is the proper syntax to check if a particular element is present in a list?

Options:

if ele in list

if not ele not in list

Both A and B

None of the above

Answer: if ele in list

Q13. What will be the type of the variable sorted_numbers in the below code snippet?

Snippet:

Python
numbers = (4, 7, 19, 2, 89, 45, 72, 22)
sorted_numbers = sorted(numbers)
print(sorted_numbers)
Options:

List

Tuple

String

Int

Answer: List

Q14. What will be the output of the following code snippet?

Snippet:

Python
def thrive(n):
    if n % 15 == 0:
        print("thrive", end=" ")
    elif n % 3 != 0 and n % 5 != 0:
        print("neither", end=" ")
    elif n % 3 == 0:
        print("three", end=" ")
    elif n % 5 == 0:
        print("five", end=" ")

thrive(35)
thrive(56)
thrive(15)
thrive(39)
Options:

five neither thrive three

five neither three thrive

three three three three

five neither five neither

Answer: five neither thrive three

Q15. What will be the output of the following code snippet?

Snippet:

Python
numbers = (4, 7, 19, 2, 89, 45, 72, 22)
sorted_numbers = sorted(numbers)
even = lambda a: a % 2 == 0
even_numbers = filter(even, sorted_numbers)
print(type(even_numbers))
Options:

filter

int

list

tuple

Answer: filter

Q16. What will be the output of the following code snippet?

Snippet:

Python
numbers = (4, 7, 19, 2, 89, 45, 72, 22)
sorted_numbers = sorted(numbers)
odd_numbers = [x for x in sorted_numbers if x % 2 != 0]
print(odd_numbers)
Options:

[7, 19, 45, 89]

[2, 4, 22, 72]

[4, 7, 19, 2, 89, 45, 72, 22]

[2, 4, 7, 19, 22, 45, 72, 89]

Answer: [7, 19, 45, 89]

Q17. What will be the output of the following code snippet?

Snippet:

Python
def check():
    print("Even" if a % 2 == 0 else "Odd")

check(12)
Options:

Even

Odd

Error

None

Answer: Error

Q18. What will be the output of the following code snippet?

Snippet:

Python
example = ["Sunday", "Monday", "Tuesday", "Wednesday"]
print(example[-3:-1])
Options:

['Monday', 'Tuesday']

['Sunday', 'Monday']

['Tuesday', 'Wednesday']

['Wednesday', 'Monday']

Answer: ['Monday', 'Tuesday']

Q19. What will be the output of the following code snippet?

Snippet:

Python
def is_even(number):
    message = f"{number} is an even number" if number % 2 == 0 else f"{number} is an odd number"
    return message

print(is_even(54))
Options:

54 is an even number

54 is an odd number

number is an even number

number is an odd number

Answer: 54 is an even number

Q20. What will be the output of the following code snippet?

Snippet:

Python
dict1 = {'first': 'sunday', 'second': 'monday'}
dict2 = {1: 3, 2: 4}
dict1.update(dict2)
print(dict1)
Options:

{'first': 'sunday', 'second': 'monday', 1: 3, 2: 4}

{'first': 'sunday', 'second': 'monday'}

{1: 3, 2: 4}

None of the above.

Answer: {'first': 'sunday', 'second': 'monday', 1: 3, 2: 4}`;

function preParseQuestions(raw) {
    const chunks = raw.split(/(?=Q\d+[\.\)]\s)/i).filter(s => s.trim());
    const questions = [];

    for (const chunk of chunks) {
        const t = chunk.trim();
        if (!/^Q\d+[\.\)]\s/i.test(t)) continue;

        const body = t.replace(/^Q\d+[\.\)]\s*/i, '');

        const optIdx = body.search(/\nOptions:\s*\n/i);
        const ansIdx = body.search(/\nAnswer:\s*/i);
        if (optIdx === -1) {
            console.log('  ⚠️ No "Options:" found, skipping chunk starting with:', t.substring(0, 50));
            continue;
        }

        let qPart = body.slice(0, optIdx).trim();

        let questionText = qPart;
        let code = '';
        const snippetMatch = qPart.match(/\n\s*Snippet:\s*\n+\s*Python\s*\n/i);
        const pythonMatch = qPart.match(/\n\s*Python\s*\n/i);

        if (snippetMatch) {
            questionText = qPart.slice(0, snippetMatch.index).trim();
            code = qPart.slice(snippetMatch.index + snippetMatch[0].length).trim();
        } else if (pythonMatch) {
            questionText = qPart.slice(0, pythonMatch.index).trim();
            code = qPart.slice(pythonMatch.index + pythonMatch[0].length).trim();
        }

        const optMatch = body.slice(optIdx).match(/\nOptions:\s*\n/i);
        const optRaw = ansIdx !== -1
            ? body.slice(optIdx + optMatch[0].length, ansIdx)
            : body.slice(optIdx + optMatch[0].length);
        const optTexts = optRaw.split('\n').map(l => l.trim()).filter(Boolean);

        let correctAns = '';
        if (ansIdx !== -1) {
            correctAns = body.slice(ansIdx).replace(/^\nAnswer:\s*/i, '').trim();
            correctAns = correctAns.replace(/\s*\(.*$/, '').replace(/\.\s*$/, '').trim();
        }

        const options = optTexts.map(opt => {
            const optClean = opt.replace(/\.\s*$/, '').trim().toLowerCase();
            const ansClean = correctAns.replace(/\.\s*$/, '').trim().toLowerCase();
            const isCorrect = optClean === ansClean || ansClean.startsWith(optClean) || optClean.startsWith(ansClean)
                || ansClean.includes(optClean) || optClean.includes(ansClean);
            return { text: opt, correct: isCorrect };
        });

        const correctCount = options.filter(o => o.correct).length;
        if (correctCount === 0 && options.length > 0) options[0].correct = true;
        if (correctCount > 1) {
            let found = false;
            options.forEach(o => { if (o.correct && found) o.correct = false; if (o.correct) found = true; });
        }

        questions.push({ text: questionText, code, options });
    }
    return questions;
}

// ── RUN TEST ──
const result = preParseQuestions(rawInput);
console.log(`\n✅ Total questions parsed: ${result.length}\n`);
result.forEach((q, i) => {
    const correctOpt = q.options.find(o => o.correct);
    console.log(`Q${i+1}: ${q.text.substring(0, 60)}...`);
    if (q.code) console.log(`  📝 Code: ${q.code.substring(0, 50)}...`);
    console.log(`  Options: ${q.options.length} | Correct: ${correctOpt?.text || 'NONE'}`);
});
