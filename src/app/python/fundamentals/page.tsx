'use client';
import ContentPage, { CodeBlock, Section, InfoBox } from '@/components/content/ContentPage';

export default function PythonFundamentals() {
    return (
        <ContentPage title="Python Fundamentals" breadcrumb={{ label: 'Python', href: '/python' }}>

            {/* ── Introduction to Python ── */}
            <Section title="Introduction to Python">
                <p>Python is a high-level, interpreted programming language known for its readability and simplicity. Created by <strong>Guido van Rossum</strong> and first released in <strong>1991</strong>, Python&apos;s design philosophy emphasizes code readability with its notable use of significant whitespace.</p>

                <h3 className="text-lg font-semibold mt-4 mb-2">Development of Python</h3>
                <p>Guido van Rossum began working on Python in the late 1980s as a successor to the ABC programming language. He wanted to create a language that was extensible and had better exception handling than its predecessors. The name &quot;Python&quot; was inspired by the British comedy group Monty Python, as van Rossum was a fan of Monty Python&apos;s Flying Circus.</p>
                <p>Python was designed to be a highly readable language. Its formatting is visually uncluttered, and it frequently uses English keywords where other languages use punctuation. Python&apos;s syntax allows programmers to express concepts in fewer lines of code than possible in languages such as C++ or Java.</p>

                <InfoBox type="tip">Python uses indentation instead of curly braces to define code blocks. This makes code cleaner and more uniform.</InfoBox>
            </Section>

            {/* ── Python Versions ── */}
            <Section title="Python Versions">
                <div className="overflow-x-auto my-4">
                    <table className="w-full text-sm border-collapse">
                        <thead><tr className="bg-blue-600 text-white"><th className="p-3 text-left">Version</th><th className="p-3 text-left">Year</th><th className="p-3 text-left">Details</th></tr></thead>
                        <tbody>
                            <tr className="border-b"><td className="p-3 font-mono">Python 1.0</td><td className="p-3">1994</td><td className="p-3">First major release</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-3 font-mono">Python 2.0</td><td className="p-3">2000</td><td className="p-3">Introduced list comprehensions</td></tr>
                            <tr className="border-b"><td className="p-3 font-mono">Python 2.7</td><td className="p-3">2010</td><td className="p-3">Final 2.x release</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-3 font-mono">Python 3.0</td><td className="p-3">2008</td><td className="p-3">Major revision with breaking changes</td></tr>
                            <tr className="border-b"><td className="p-3 font-mono">Python 3.11</td><td className="p-3">2022</td><td className="p-3">Faster execution, improved error messages</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-3 font-mono">Python 3.12</td><td className="p-3">2023</td><td className="p-3">Latest stable release</td></tr>
                        </tbody>
                    </table>
                </div>
                <p>Python 2 reached end-of-life on January 1, 2020, and is no longer maintained. Python 3 introduced significant changes to the language, improving Unicode support, division operations, and fixing design flaws.</p>
            </Section>

            {/* ── Advantages of Python ── */}
            <Section title="Advantages of Python">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-bold text-blue-800 mb-1">Easy to Learn and Use</h4>
                        <p className="text-sm">Python has a simple, easy-to-learn syntax that emphasizes readability, reducing program maintenance costs and making it accessible to beginners.</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <h4 className="font-bold text-green-800 mb-1">Versatility</h4>
                        <p className="text-sm">Python is used in web development, data analysis, AI, scientific computing, automation, and more.</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                        <h4 className="font-bold text-purple-800 mb-1">Large Standard Library</h4>
                        <p className="text-sm">Python comes with a vast standard library that provides modules for various tasks, reducing the need for external libraries.</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                        <h4 className="font-bold text-orange-800 mb-1">Interpreted Language</h4>
                        <p className="text-sm">Being an interpreted language, Python code is executed line by line, making debugging easier and more efficient.</p>
                    </div>
                    <div className="p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500">
                        <h4 className="font-bold text-teal-800 mb-1">Open Source</h4>
                        <p className="text-sm">Python is free to use and distribute, even for commercial purposes, under an OSI-approved open-source license.</p>
                    </div>
                    <div className="p-4 bg-pink-50 rounded-lg border-l-4 border-pink-500">
                        <h4 className="font-bold text-pink-800 mb-1">Strong Community Support</h4>
                        <p className="text-sm">Python has a large and active community that contributes to libraries, provides support, and shares knowledge.</p>
                    </div>
                </div>
            </Section>

            {/* ── Working with Python ── */}
            <Section title="Working with Python">
                <h3 className="text-lg font-semibold mt-2 mb-2">Installing Python</h3>
                <ol className="list-decimal ml-6 space-y-2 mb-4">
                    <li><strong>Download Python:</strong> Visit the official Python website at <a href="https://www.python.org/downloads/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">python.org/downloads</a> and download the latest version.</li>
                    <li><strong>Run the Installer:</strong>
                        <ul className="list-disc ml-6 mt-1">
                            <li>On Windows: Make sure to check &quot;Add Python to PATH&quot; before clicking Install Now.</li>
                            <li>On macOS: Follow the instructions in the installer.</li>
                            <li>On Linux: Use your package manager (e.g., <code>apt-get install python3</code>).</li>
                        </ul>
                    </li>
                    <li><strong>Verify Installation:</strong></li>
                </ol>
                <CodeBlock code={`python --version`} />

                <h3 className="text-lg font-semibold mt-6 mb-2">Python Interactive Mode</h3>
                <p>Python offers an interactive mode where you can write and execute code line by line. This is great for testing small code snippets.</p>
                <CodeBlock code={`>>> print("Hello, World!")
Hello, World!
>>> 2 + 3
5
>>> name = "Python"
>>> print(f"I love {name} programming!")
I love Python programming!`} />
                <p>To exit interactive mode, type <code>exit()</code> or press Ctrl+Z (Windows) / Ctrl+D (Unix).</p>

                <h3 className="text-lg font-semibold mt-6 mb-2">Python Program Mode</h3>
                <p>For larger programs, write your code in a file with a <code>.py</code> extension and execute it:</p>
                <CodeBlock code={`# This is program.py
print("Running Python in program mode")

for i in range(5):
    print(f"Count: {i}")`} />
            </Section>

            {/* ── Creating Modules and Program Files ── */}
            <Section title="Creating Modules and Program Files">
                <h3 className="text-lg font-semibold mt-2 mb-2">Creating a Python File</h3>
                <ol className="list-decimal ml-6 space-y-1 mb-4">
                    <li>Open your preferred text editor (VSCode, PyCharm, Sublime Text, etc.)</li>
                    <li>Create a new file</li>
                    <li>Write your Python code</li>
                    <li>Save the file with a <code>.py</code> extension (e.g., <code>my_program.py</code>)</li>
                </ol>

                <h3 className="text-lg font-semibold mt-4 mb-2">Running a Python File</h3>
                <p><strong>Using Command Line:</strong></p>
                <CodeBlock code={`python my_program.py`} />
                <p><strong>From an IDE:</strong> Most IDEs have a &quot;Run&quot; button or keyboard shortcut (like F5 in VSCode).</p>
            </Section>

            {/* ── Python Tokens ── */}
            <Section title="Python Tokens">
                <p>In Python, a token is the smallest unit of a program. The Python interpreter breaks down a program into tokens before parsing it. There are five types of tokens:</p>

                <h3 className="text-lg font-semibold mt-4 mb-2">Identifiers</h3>
                <p>An identifier is a name used to identify a variable, function, class, module, or other object. Rules:</p>
                <ul className="list-disc ml-6 space-y-1 mb-4">
                    <li>Can only start with a letter (A-Z, a-z) or underscore (_)</li>
                    <li>Can consist of letters, underscores, and digits (0-9)</li>
                    <li>Are case-sensitive (<code>name</code>, <code>Name</code>, and <code>NAME</code> are different)</li>
                    <li>Reserved keywords cannot be used as identifiers</li>
                    <li>Special symbols like !, @, #, $, % cannot be used</li>
                    <li>No limit on the length of an identifier</li>
                </ul>

                <p><strong>Valid identifiers:</strong></p>
                <CodeBlock code={`name
student_1
_private
totalSum
get_value
UserAccount`} />

                <p><strong>Invalid identifiers:</strong></p>
                <CodeBlock code={`123name  # Cannot start with a digit
my-var   # Hyphen not allowed
for      # Reserved keyword
$amount  # Special symbol not allowed`} />

                <h3 className="text-lg font-semibold mt-6 mb-2">Keywords</h3>
                <p>Keywords are reserved words that have special meanings in Python. They cannot be used as identifiers.</p>

                <div className="overflow-x-auto my-4">
                    <table className="w-full text-sm border-collapse">
                        <thead><tr className="bg-blue-600 text-white"><th className="p-3 text-left" colSpan={5}>Python Keywords</th></tr></thead>
                        <tbody>
                            <tr className="border-b"><td className="p-2 font-mono">False</td><td className="p-2 font-mono">None</td><td className="p-2 font-mono">True</td><td className="p-2 font-mono">and</td><td className="p-2 font-mono">as</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-2 font-mono">assert</td><td className="p-2 font-mono">async</td><td className="p-2 font-mono">await</td><td className="p-2 font-mono">break</td><td className="p-2 font-mono">class</td></tr>
                            <tr className="border-b"><td className="p-2 font-mono">continue</td><td className="p-2 font-mono">def</td><td className="p-2 font-mono">del</td><td className="p-2 font-mono">elif</td><td className="p-2 font-mono">else</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-2 font-mono">except</td><td className="p-2 font-mono">finally</td><td className="p-2 font-mono">for</td><td className="p-2 font-mono">from</td><td className="p-2 font-mono">global</td></tr>
                            <tr className="border-b"><td className="p-2 font-mono">if</td><td className="p-2 font-mono">import</td><td className="p-2 font-mono">in</td><td className="p-2 font-mono">is</td><td className="p-2 font-mono">lambda</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-2 font-mono">nonlocal</td><td className="p-2 font-mono">not</td><td className="p-2 font-mono">or</td><td className="p-2 font-mono">pass</td><td className="p-2 font-mono">raise</td></tr>
                            <tr className="border-b"><td className="p-2 font-mono">return</td><td className="p-2 font-mono">try</td><td className="p-2 font-mono">while</td><td className="p-2 font-mono">with</td><td className="p-2 font-mono">yield</td></tr>
                        </tbody>
                    </table>
                </div>

                <p>You can check all keywords using the <code>keyword</code> module:</p>
                <CodeBlock code={`>>> import keyword
>>> print(keyword.kwlist)`} />
            </Section>

            {/* ── Literals ── */}
            <Section title="Literals">
                <p>Literals are data items that have a fixed value. Python supports different types of literals:</p>

                <h3 className="text-lg font-semibold mt-4 mb-2">String Literals</h3>
                <p>String literals are enclosed within single quotes (&apos; &apos;), double quotes (&quot; &quot;), or triple quotes (&apos;&apos;&apos; &apos;&apos;&apos; or &quot;&quot;&quot; &quot;&quot;&quot;).</p>

                <p><strong>Single-line String:</strong></p>
                <CodeBlock code={`name = 'John'
message = "Hello, World!"`} />

                <p><strong>Multi-line String using Triple Quotes:</strong></p>
                <CodeBlock code={`long_text = """This is a long text
that spans over multiple lines.
Triple quotes allow this."""`} />

                <p><strong>Multi-line String using Backslash:</strong></p>
                <CodeBlock code={`another_text = "This is another long text \\
that continues on the next line \\
using backslashes."`} />

                <h3 className="text-lg font-semibold mt-6 mb-2">Numeric Literals</h3>
                <p><strong>Integer Literals:</strong></p>
                <CodeBlock code={`a = 10      # Decimal
b = 0b1010  # Binary (starts with 0b)
c = 0o12    # Octal (starts with 0o)
d = 0xA     # Hexadecimal (starts with 0x)`} />

                <p><strong>Float Literals:</strong></p>
                <CodeBlock code={`x = 10.5
y = 1.5e2    # Scientific notation (150.0)
z = .5       # Same as 0.5`} />

                <p><strong>Complex Literals:</strong></p>
                <p>Complex numbers are written in the form of a + bj, where a is the real part and b is the imaginary part.</p>
                <CodeBlock code={`complex_num = 3 + 5j`} />

                <h3 className="text-lg font-semibold mt-6 mb-2">Boolean Literals</h3>
                <p>Boolean literals represent truth values. There are only two: <code>True</code> and <code>False</code>.</p>
                <CodeBlock code={`is_active = True
is_completed = False`} />

                <h3 className="text-lg font-semibold mt-6 mb-2">None Literal</h3>
                <p>The <code>None</code> literal represents the absence of a value or a null value. It&apos;s often used as a placeholder for optional or missing values.</p>
                <CodeBlock code={`result = None`} />
            </Section>

            {/* ── Variables & Data Types ── */}
            <Section title="Variables & Data Types">
                <p>Variables are containers for storing data values. Python determines the type automatically.</p>
                <CodeBlock code={`# Integer
age = 25

# Float
price = 99.99

# String
name = "Knobly"

# Boolean
is_active = True

# Check type
print(type(age))    # <class 'int'>
print(type(name))   # <class 'str'>`} />
            </Section>

            {/* ── Operators ── */}
            <Section title="Operators">
                <p>Operators are special symbols that perform operations on variables and values. Python provides a wide range of operators.</p>

                <h3 className="text-lg font-semibold mt-4 mb-2">Arithmetic Operators</h3>
                <div className="overflow-x-auto my-4">
                    <table className="w-full text-sm border-collapse">
                        <thead><tr className="bg-blue-600 text-white"><th className="p-3">Operator</th><th className="p-3">Name</th><th className="p-3">Example</th><th className="p-3">Result</th></tr></thead>
                        <tbody>
                            <tr className="border-b"><td className="p-2 text-center font-mono">+</td><td className="p-2">Addition</td><td className="p-2 font-mono">5 + 3</td><td className="p-2">8</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-2 text-center font-mono">-</td><td className="p-2">Subtraction</td><td className="p-2 font-mono">5 - 3</td><td className="p-2">2</td></tr>
                            <tr className="border-b"><td className="p-2 text-center font-mono">*</td><td className="p-2">Multiplication</td><td className="p-2 font-mono">5 * 3</td><td className="p-2">15</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-2 text-center font-mono">/</td><td className="p-2">Division</td><td className="p-2 font-mono">5 / 3</td><td className="p-2">1.666...</td></tr>
                            <tr className="border-b"><td className="p-2 text-center font-mono">//</td><td className="p-2">Floor Division</td><td className="p-2 font-mono">5 // 3</td><td className="p-2">1</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-2 text-center font-mono">%</td><td className="p-2">Modulus</td><td className="p-2 font-mono">5 % 3</td><td className="p-2">2</td></tr>
                            <tr className="border-b"><td className="p-2 text-center font-mono">**</td><td className="p-2">Exponentiation</td><td className="p-2 font-mono">5 ** 3</td><td className="p-2">125</td></tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-2">Relational (Comparison) Operators</h3>
                <div className="overflow-x-auto my-4">
                    <table className="w-full text-sm border-collapse">
                        <thead><tr className="bg-blue-600 text-white"><th className="p-3">Operator</th><th className="p-3">Name</th><th className="p-3">Example</th><th className="p-3">Result</th></tr></thead>
                        <tbody>
                            <tr className="border-b"><td className="p-2 text-center font-mono">==</td><td className="p-2">Equal to</td><td className="p-2 font-mono">5 == 3</td><td className="p-2">False</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-2 text-center font-mono">!=</td><td className="p-2">Not equal to</td><td className="p-2 font-mono">5 != 3</td><td className="p-2">True</td></tr>
                            <tr className="border-b"><td className="p-2 text-center font-mono">&gt;</td><td className="p-2">Greater than</td><td className="p-2 font-mono">5 &gt; 3</td><td className="p-2">True</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-2 text-center font-mono">&lt;</td><td className="p-2">Less than</td><td className="p-2 font-mono">5 &lt; 3</td><td className="p-2">False</td></tr>
                            <tr className="border-b"><td className="p-2 text-center font-mono">&gt;=</td><td className="p-2">Greater than or equal</td><td className="p-2 font-mono">5 &gt;= 5</td><td className="p-2">True</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-2 text-center font-mono">&lt;=</td><td className="p-2">Less than or equal</td><td className="p-2 font-mono">3 &lt;= 5</td><td className="p-2">True</td></tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-2">Assignment Operators</h3>
                <div className="overflow-x-auto my-4">
                    <table className="w-full text-sm border-collapse">
                        <thead><tr className="bg-blue-600 text-white"><th className="p-3">Operator</th><th className="p-3">Example</th><th className="p-3">Equivalent to</th></tr></thead>
                        <tbody>
                            <tr className="border-b"><td className="p-2 text-center font-mono">=</td><td className="p-2 font-mono">x = 5</td><td className="p-2 font-mono">x = 5</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-2 text-center font-mono">+=</td><td className="p-2 font-mono">x += 5</td><td className="p-2 font-mono">x = x + 5</td></tr>
                            <tr className="border-b"><td className="p-2 text-center font-mono">-=</td><td className="p-2 font-mono">x -= 5</td><td className="p-2 font-mono">x = x - 5</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-2 text-center font-mono">*=</td><td className="p-2 font-mono">x *= 5</td><td className="p-2 font-mono">x = x * 5</td></tr>
                            <tr className="border-b"><td className="p-2 text-center font-mono">/=</td><td className="p-2 font-mono">x /= 5</td><td className="p-2 font-mono">x = x / 5</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-2 text-center font-mono">//=</td><td className="p-2 font-mono">x //= 5</td><td className="p-2 font-mono">x = x // 5</td></tr>
                            <tr className="border-b"><td className="p-2 text-center font-mono">%=</td><td className="p-2 font-mono">x %= 5</td><td className="p-2 font-mono">x = x % 5</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-2 text-center font-mono">**=</td><td className="p-2 font-mono">x **= 5</td><td className="p-2 font-mono">x = x ** 5</td></tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-2">Identity Operators</h3>
                <p>Identity operators are used to compare objects — not if they are equal, but if they are the same object with the same memory location.</p>
                <div className="overflow-x-auto my-4">
                    <table className="w-full text-sm border-collapse">
                        <thead><tr className="bg-blue-600 text-white"><th className="p-3">Operator</th><th className="p-3">Description</th><th className="p-3">Example</th></tr></thead>
                        <tbody>
                            <tr className="border-b"><td className="p-2 text-center font-mono">is</td><td className="p-2">Returns True if both variables are the same object</td><td className="p-2 font-mono">x is y</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-2 text-center font-mono">is not</td><td className="p-2">Returns True if both variables are not the same object</td><td className="p-2 font-mono">x is not y</td></tr>
                        </tbody>
                    </table>
                </div>
                <CodeBlock code={`a = [1, 2, 3]
b = [1, 2, 3]
c = a

print(a is b)    # False (different objects with the same value)
print(a is c)    # True (same object)`} />

                <h3 className="text-lg font-semibold mt-6 mb-2">Membership Operators</h3>
                <p>Membership operators are used to test if a sequence is present in an object.</p>
                <div className="overflow-x-auto my-4">
                    <table className="w-full text-sm border-collapse">
                        <thead><tr className="bg-blue-600 text-white"><th className="p-3">Operator</th><th className="p-3">Description</th><th className="p-3">Example</th></tr></thead>
                        <tbody>
                            <tr className="border-b"><td className="p-2 text-center font-mono">in</td><td className="p-2">True if value is found in the sequence</td><td className="p-2 font-mono">x in y</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-2 text-center font-mono">not in</td><td className="p-2">True if value is not found in the sequence</td><td className="p-2 font-mono">x not in y</td></tr>
                        </tbody>
                    </table>
                </div>
                <CodeBlock code={`fruits = ["apple", "banana", "cherry"]
print("banana" in fruits)     # True
print("pear" not in fruits)   # True`} />
            </Section>

            {/* ── Python Punctuation ── */}
            <Section title="Python Punctuation">
                <p>Python uses various punctuation marks for different purposes:</p>
                <ul className="list-disc ml-6 space-y-1 mb-4">
                    <li><strong>Colon (:)</strong> — Used in if, for, while, class, and function definitions.</li>
                    <li><strong>Semicolon (;)</strong> — Separates multiple statements on a single line.</li>
                    <li><strong>Comma (,)</strong> — Separates items in lists, tuples, and function arguments.</li>
                    <li><strong>Period (.)</strong> — Used for attribute and method access, or for floating-point numbers.</li>
                    <li><strong>Parentheses ()</strong> — Used in function calls, expressions, and tuples.</li>
                    <li><strong>Square brackets []</strong> — Used for lists and indexing.</li>
                    <li><strong>Curly braces {'{}'}</strong> — Used for dictionaries and sets.</li>
                    <li><strong>Hash (#)</strong> — Used for comments.</li>
                </ul>
                <CodeBlock code={`# Example of Python punctuation usage
def greet(name):  # Function definition with colon
    print("Hello, " + name + "!")  # Period in function name
    
names = ["Alice", "Bob", "Charlie"]  # Square brackets for list
person = {"name": "David", "age": 30}  # Curly braces for dictionary
                
result = (1 + 2) * 3  # Parentheses affect operator precedence`} />
            </Section>

            {/* ── Print Statement ── */}
            <Section title="Print Statement in Python">
                <p>The <code>print()</code> function is used to output data to the standard output device (screen).</p>

                <h3 className="text-lg font-semibold mt-4 mb-2">Basic Print Usage</h3>
                <CodeBlock code={`print("Hello, World!")  # Outputs: Hello, World!
print(10)             # Outputs: 10
print(True)           # Outputs: True`} />

                <h3 className="text-lg font-semibold mt-4 mb-2">Printing Multiple Items</h3>
                <CodeBlock code={`print("Name:", "Alice", "Age:", 25)  # Outputs: Name: Alice Age: 25`} />

                <h3 className="text-lg font-semibold mt-4 mb-2">Print with Separator and End Parameters</h3>
                <CodeBlock code={`# Custom separator
print("apple", "banana", "cherry", sep="|")  # Outputs: apple|banana|cherry

# Custom end character (default is newline)
print("Hello", end=" ")
print("World")  # Outputs: Hello World`} />

                <h3 className="text-lg font-semibold mt-4 mb-2">Formatted String Literals (f-strings)</h3>
                <CodeBlock code={`name = "Alice"
age = 25
print(f"My name is {name} and I am {age} years old.")
# Outputs: My name is Alice and I am 25 years old.`} />

                <h3 className="text-lg font-semibold mt-4 mb-2">Format Method</h3>
                <CodeBlock code={`print("My name is {} and I am {} years old.".format(name, age))

# With position indexes
print("My name is {0} and I am {1} years old.".format(name, age))

# With named parameters
print("My name is {n} and I am {a} years old.".format(n=name, a=age))`} />

                <h3 className="text-lg font-semibold mt-4 mb-2">Old-style String Formatting</h3>
                <CodeBlock code={`print("My name is %s and I am %d years old." % (name, age))
# Outputs: My name is Alice and I am 25 years old.`} />
            </Section>

            {/* ── Input Statement ── */}
            <Section title="Input Statement in Python">
                <p>The <code>input()</code> function allows user input from the standard input device (keyboard).</p>

                <h3 className="text-lg font-semibold mt-4 mb-2">Basic Input Usage</h3>
                <CodeBlock code={`name = input("Enter your name: ")
print("Hello, " + name + "!")`} />

                <InfoBox type="note">The <code>input()</code> function always returns a string, even if the user enters a number.</InfoBox>

                <h3 className="text-lg font-semibold mt-4 mb-2">Converting Input to Other Types</h3>
                <CodeBlock code={`# Converting input to an integer
age = int(input("Enter your age: "))
next_year_age = age + 1
print(f"Next year, you will be {next_year_age} years old.")

# Converting input to a float
height = float(input("Enter your height in meters: "))
print(f"Your height is {height} meters.")`} />

                <h3 className="text-lg font-semibold mt-4 mb-2">Input Validation Example</h3>
                <CodeBlock code={`while True:
    try:
        number = int(input("Enter a positive number: "))
        if number <= 0:
            print("That's not a positive number. Try again.")
        else:
            break
    except ValueError:
        print("That's not a valid number. Try again.")
        
print(f"You entered: {number}")`} />

                <h3 className="text-lg font-semibold mt-4 mb-2">Multiple Inputs</h3>
                <CodeBlock code={`# Getting multiple inputs on separate lines
first_name = input("Enter your first name: ")
last_name = input("Enter your last name: ")
print(f"Hello, {first_name} {last_name}!")

# Getting multiple inputs on a single line
x, y = input("Enter two numbers separated by space: ").split()
x, y = int(x), int(y)
print(f"Sum: {x + y}")`} />
            </Section>

            {/* ── String Operations ── */}
            <Section title="String Operations">
                <CodeBlock code={`s = "Knobly OS"
print(len(s))          # 9
print(s.upper())       # KNOBLY OS
print(s.lower())       # knobly os
print(s[0:6])          # Knobly
print(s.replace("OS", "System"))  # Knobly System
print("Knobly" in s)   # True`} />
            </Section>

            {/* ── Practice Questions ── */}
            <Section title="Practice Questions">
                <p>Test your understanding of Python operators with these practice questions:</p>

                <div className="space-y-4 mt-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-bold mb-2">Question 1: Arithmetic Operators</h4>
                        <p>What will be the output?</p>
                        <CodeBlock code={`a = 10
b = 3
print(a // b)
print(a % b)
print(a ** b)`} />
                        <p className="text-sm text-gray-600 mt-2"><strong>Think:</strong> Calculate the floor division, modulus, and exponentiation.</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-bold mb-2">Question 2: Comparison and Logical Operators</h4>
                        <p>What will be the output?</p>
                        <CodeBlock code={`x = 5
y = 10
z = 5
print(x == z)
print(x != y)
print(x > y or x == z)
print(x < y and y > z)`} />
                        <p className="text-sm text-gray-600 mt-2"><strong>Think:</strong> Evaluate each comparison and logical expression step by step.</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-bold mb-2">Question 3: Identity vs Equality</h4>
                        <p>What will be the output?</p>
                        <CodeBlock code={`list1 = [1, 2, 3]
list2 = [1, 2, 3]
list3 = list1
print(list1 == list2)
print(list1 is list2)
print(list1 is list3)`} />
                        <p className="text-sm text-gray-600 mt-2"><strong>Think:</strong> Understand the difference between equality (==) and identity (is).</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-bold mb-2">Question 4: Membership Operators</h4>
                        <p>What will be the output?</p>
                        <CodeBlock code={`fruits = ["apple", "banana", "cherry"]
print("apple" in fruits)
print("grape" not in fruits)
print("ban" in "banana")`} />
                        <p className="text-sm text-gray-600 mt-2"><strong>Think:</strong> Understand how membership operators work with different sequence types.</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-bold mb-2">Question 5: Assignment Operators</h4>
                        <p>What will be the final value of x?</p>
                        <CodeBlock code={`x = 10
x += 5
x *= 2
x //= 3
print(x)`} />
                        <p className="text-sm text-gray-600 mt-2"><strong>Think:</strong> Calculate each step of the compound assignments.</p>
                    </div>
                </div>
            </Section>
        </ContentPage>
    );
}
