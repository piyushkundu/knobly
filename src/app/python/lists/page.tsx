'use client';
import ContentPage, { CodeBlock, Section, InfoBox } from '@/components/content/ContentPage';

export default function ListsPage() {
    return (
        <ContentPage title="Python Lists" breadcrumb={{ label: 'Python', href: '/python' }}>

            {/* ── What are Python Lists? ── */}
            <Section title="What are Python Lists?">
                <p>A list in Python is an ordered, mutable collection of elements. Lists are one of the most versatile and commonly used data structures in Python. They allow you to store multiple items in a single variable, and each element can be accessed using an index.</p>

                <p>Key characteristics of Python lists:</p>
                <ul className="list-disc ml-6 space-y-1 mb-4">
                    <li><strong>Ordered:</strong> Elements maintain their order when stored.</li>
                    <li><strong>Mutable:</strong> You can add, remove, or modify elements after creation.</li>
                    <li><strong>Indexed:</strong> Elements can be accessed by their position (index).</li>
                    <li><strong>Heterogeneous:</strong> Can store elements of different data types.</li>
                    <li><strong>Dynamic:</strong> Can grow or shrink in size as needed.</li>
                </ul>
                <CodeBlock code={`# A simple Python list example
fruits = ["apple", "banana", "cherry", "orange"]
print(fruits)  # Output: ['apple', 'banana', 'cherry', 'orange']`} />
            </Section>

            {/* ── Types of Python Lists ── */}
            <Section title="Types of Python Lists">
                <h3 id="empty-list" className="text-lg font-semibold mt-2 mb-2">Empty List</h3>
                <p>A list with no elements.</p>
                <CodeBlock code={`empty_list = []
print(empty_list)  # Output: []`} />

                <h3 id="list-of-integers" className="text-lg font-semibold mt-4 mb-2">List of Integers</h3>
                <p>A list containing only integer values.</p>
                <CodeBlock code={`integers = [1, 2, 3, 4, 5]
print(integers)  # Output: [1, 2, 3, 4, 5]`} />

                <h3 id="list-of-floating-point-numbers" className="text-lg font-semibold mt-4 mb-2">List of Floating Point Numbers</h3>
                <p>A list containing decimal or floating-point values.</p>
                <CodeBlock code={`floats = [1.1, 2.2, 3.3, 4.4, 5.5]
print(floats)  # Output: [1.1, 2.2, 3.3, 4.4, 5.5]`} />

                <h3 id="list-of-characters" className="text-lg font-semibold mt-4 mb-2">List of Characters</h3>
                <p>A list containing individual characters.</p>
                <CodeBlock code={`characters = ['a', 'b', 'c', 'd', 'e']
print(characters)  # Output: ['a', 'b', 'c', 'd', 'e']`} />

                <h3 id="list-of-strings" className="text-lg font-semibold mt-4 mb-2">List of Strings</h3>
                <p>A list containing text strings.</p>
                <CodeBlock code={`strings = ["apple", "banana", "cherry"]
print(strings)  # Output: ['apple', 'banana', 'cherry']`} />

                <h3 id="mixed-value-list" className="text-lg font-semibold mt-4 mb-2">Mixed Value List</h3>
                <p>A list containing different types of elements.</p>
                <CodeBlock code={`mixed = [1, "Hello", 3.14, True, [1, 2, 3]]
print(mixed)  # Output: [1, 'Hello', 3.14, True, [1, 2, 3]]`} />
            </Section>

            {/* ── Creating Python Lists ── */}
            <Section title="Creating Python Lists">
                <p>There are three primary ways to create lists in Python:</p>

                <h3 id="1-creating-by-assigning-values" className="text-lg font-semibold mt-4 mb-2">1. Creating by Assigning Values</h3>
                <p>The most direct way is to create a list by defining values within square brackets.</p>
                <CodeBlock code={`# Creating a list by directly assigning values
fruits = ["apple", "banana", "cherry"]
numbers = [1, 2, 3, 4, 5]`} />

                <h3 id="2-creating-from-other-sequences" className="text-lg font-semibold mt-4 mb-2">2. Creating from Other Sequences</h3>
                <p>You can create a list from other sequences such as tuples, strings, sets, or dictionaries using the list() constructor.</p>
                <CodeBlock code={`# Creating a list from a tuple
tuple_example = (1, 2, 3)
list_from_tuple = list(tuple_example)
print(list_from_tuple)  # Output: [1, 2, 3]

# Creating a list from a string
string_example = "Python"
list_from_string = list(string_example)
print(list_from_string)  # Output: ['P', 'y', 't', 'h', 'o', 'n']

# Creating a list from a range
list_from_range = list(range(1, 6))
print(list_from_range)  # Output: [1, 2, 3, 4, 5]`} />

                <h3 id="3-creating-dynamically-via-user-input" className="text-lg font-semibold mt-4 mb-2">3. Creating Dynamically via User Input</h3>
                <p>You can create lists by gathering input from users or other dynamic sources.</p>
                <CodeBlock code={`# Creating a list dynamically with user input
n = int(input("Enter number of elements: "))
user_list = []

for i in range(n):
    element = input(f"Enter element {i+1}: ")
    try:
        element = int(element)
    except ValueError:
        try:
            element = float(element)
        except ValueError:
            pass
    user_list.append(element)

print("Your list:", user_list)`} />

                <p>You can also use list comprehensions, which provide a concise way to create lists:</p>
                <CodeBlock code={`# List comprehension
squares = [x**2 for x in range(1, 6)]
print(squares)  # Output: [1, 4, 9, 16, 25]`} />
            </Section>

            {/* ── Accessing Elements ── */}
            <Section title="Accessing Elements in Python Lists">
                <p>There are two main ways to access elements in a Python list:</p>

                <h3 id="1-accessing-the-whole-list-at-once" className="text-lg font-semibold mt-4 mb-2">1. Accessing the Whole List at Once</h3>
                <p>You can access the entire list by simply referring to its variable name.</p>
                <CodeBlock code={`fruits = ["apple", "banana", "cherry", "orange"]
print(fruits)  # Output: ['apple', 'banana', 'cherry', 'orange']`} />

                <h3 id="2-accessing-individual-elements" className="text-lg font-semibold mt-4 mb-2">2. Accessing Individual Elements</h3>
                <p>You can access individual elements using indexing. Python uses zero-based indexing, meaning the first element is at index 0.</p>
                <CodeBlock code={`fruits = ["apple", "banana", "cherry", "orange"]

# Accessing elements by positive index (from the beginning)
print(fruits[0])  # Output: apple (first element)
print(fruits[2])  # Output: cherry (third element)

# Accessing elements by negative index (from the end)
print(fruits[-1])  # Output: orange (last element)
print(fruits[-2])  # Output: cherry (second last element)`} />

                <p>You can also access a range of elements using slicing:</p>
                <CodeBlock code={`fruits = ["apple", "banana", "cherry", "orange", "kiwi", "melon", "mango"]

# Basic slicing [start:stop] (stop index is excluded)
print(fruits[1:4])  # Output: ['banana', 'cherry', 'orange']

# Slicing with step [start:stop:step]
print(fruits[0:6:2])  # Output: ['apple', 'cherry', 'kiwi']

# Omitting start or stop
print(fruits[:3])  # Output: ['apple', 'banana', 'cherry']
print(fruits[4:])  # Output: ['kiwi', 'melon', 'mango']

# Negative slicing
print(fruits[-3:])  # Output: ['kiwi', 'melon', 'mango']`} />
            </Section>

            {/* ── Traversing Python Lists ── */}
            <Section title="Traversing Python Lists">
                <p>Traversing a list means accessing each element of the list sequentially. There are several ways:</p>

                <h3 id="using-a-for-loop" className="text-lg font-semibold mt-4 mb-2">Using a For Loop</h3>
                <CodeBlock code={`fruits = ["apple", "banana", "cherry", "orange"]

# Simple for loop
for fruit in fruits:
    print(fruit)
# Output: apple, banana, cherry, orange`} />

                <h3 id="using-a-for-loop-with-index" className="text-lg font-semibold mt-4 mb-2">Using a For Loop with Index</h3>
                <CodeBlock code={`fruits = ["apple", "banana", "cherry", "orange"]

# Using range and len
for i in range(len(fruits)):
    print(f"Index {i}: {fruits[i]}")
# Output: Index 0: apple, Index 1: banana, ...`} />

                <h3 id="using-enumerate" className="text-lg font-semibold mt-4 mb-2">Using enumerate()</h3>
                <CodeBlock code={`fruits = ["apple", "banana", "cherry", "orange"]

# Using enumerate (provides both index and value)
for index, fruit in enumerate(fruits):
    print(f"Index {index}: {fruit}")
# Output: Index 0: apple, Index 1: banana, ...`} />

                <h3 id="using-a-while-loop" className="text-lg font-semibold mt-4 mb-2">Using a While Loop</h3>
                <CodeBlock code={`fruits = ["apple", "banana", "cherry", "orange"]

# Using a while loop
i = 0
while i < len(fruits):
    print(fruits[i])
    i += 1`} />

                <h3 id="list-comprehension-for-creating-a-new-list" className="text-lg font-semibold mt-4 mb-2">List Comprehension (for creating a new list)</h3>
                <CodeBlock code={`fruits = ["apple", "banana", "cherry", "orange"]

# Using list comprehension to create a new list
uppercase_fruits = [fruit.upper() for fruit in fruits]
print(uppercase_fruits)  # Output: ['APPLE', 'BANANA', 'CHERRY', 'ORANGE']`} />
            </Section>

            {/* ── List Operations ── */}
            <Section title="List Operations">
                <h3 id="combining-lists-concatenation" className="text-lg font-semibold mt-2 mb-2">Combining Lists (Concatenation)</h3>
                <p>You can combine lists using the + operator.</p>
                <CodeBlock code={`list1 = [1, 2, 3]
list2 = [4, 5, 6]

# Concatenation using + operator
combined_list = list1 + list2
print(combined_list)  # Output: [1, 2, 3, 4, 5, 6]`} />

                <h3 id="replicating-lists" className="text-lg font-semibold mt-4 mb-2">Replicating Lists</h3>
                <p>You can replicate a list using the * operator.</p>
                <CodeBlock code={`list1 = [1, 2, 3]

# Replication using * operator
replicated_list = list1 * 3
print(replicated_list)  # Output: [1, 2, 3, 1, 2, 3, 1, 2, 3]`} />

                <h3 id="slicing-lists" className="text-lg font-semibold mt-4 mb-2">Slicing Lists</h3>
                <p>Slicing allows you to extract a portion of a list.</p>
                <CodeBlock code={`numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

# Basic slicing
slice1 = numbers[2:6]
print(slice1)  # Output: [2, 3, 4, 5]

# Slicing with step
slice2 = numbers[1:9:2]
print(slice2)  # Output: [1, 3, 5, 7]

# Negative indices in slicing
slice3 = numbers[-5:-1]
print(slice3)  # Output: [5, 6, 7, 8]

# Omitting indices
slice4 = numbers[:5]
print(slice4)  # Output: [0, 1, 2, 3, 4]

slice5 = numbers[5:]
print(slice5)  # Output: [5, 6, 7, 8, 9]

# Reverse a list with slicing
reversed_list = numbers[::-1]
print(reversed_list)  # Output: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]`} />
            </Section>

            {/* ── List Functions and Methods ── */}
            <Section title="List Functions and Methods">
                <div className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-bold text-blue-800 mb-2">append()</h4>
                        <p className="mb-2">Adds an element to the end of the list.</p>
                        <CodeBlock code={`fruits = ["apple", "banana"]
fruits.append("cherry")
print(fruits)  # Output: ['apple', 'banana', 'cherry']`} />
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <h4 className="font-bold text-green-800 mb-2">extend()</h4>
                        <p className="mb-2">Adds all elements of a list (or any iterable) to the end of the current list.</p>
                        <CodeBlock code={`fruits = ["apple", "banana"]
more_fruits = ["cherry", "orange"]
fruits.extend(more_fruits)
print(fruits)  # Output: ['apple', 'banana', 'cherry', 'orange']`} />
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                        <h4 className="font-bold text-purple-800 mb-2">insert()</h4>
                        <p className="mb-2">Inserts an element at a specified position.</p>
                        <CodeBlock code={`fruits = ["apple", "banana", "cherry"]
fruits.insert(1, "orange")  # Insert at index 1
print(fruits)  # Output: ['apple', 'orange', 'banana', 'cherry']`} />
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                        <h4 className="font-bold text-red-800 mb-2">remove()</h4>
                        <p className="mb-2">Removes the first occurrence of the specified element.</p>
                        <CodeBlock code={`fruits = ["apple", "banana", "cherry", "banana"]
fruits.remove("banana")  # Removes the first "banana"
print(fruits)  # Output: ['apple', 'cherry', 'banana']`} />
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                        <h4 className="font-bold text-orange-800 mb-2">pop()</h4>
                        <p className="mb-2">Removes and returns the element at the specified position. If no index is specified, removes and returns the last item.</p>
                        <CodeBlock code={`fruits = ["apple", "banana", "cherry", "orange"]
removed_fruit = fruits.pop(1)  # Removes and returns "banana"
print(removed_fruit)  # Output: banana
print(fruits)  # Output: ['apple', 'cherry', 'orange']

last_fruit = fruits.pop()  # Removes and returns the last item
print(last_fruit)  # Output: orange
print(fruits)  # Output: ['apple', 'cherry']`} />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-500">
                        <h4 className="font-bold text-gray-800 mb-2">del Statement</h4>
                        <p className="mb-2">Removes an item at a specified index or deletes the entire list.</p>
                        <CodeBlock code={`fruits = ["apple", "banana", "cherry", "orange"]
del fruits[1]  # Removes item at index 1
print(fruits)  # Output: ['apple', 'cherry', 'orange']

# Delete multiple items using slicing
numbers = [0, 1, 2, 3, 4, 5]
del numbers[1:4]  # Deletes items from index 1 to 3
print(numbers)  # Output: [0, 4, 5]

# Delete the entire list
del numbers
# print(numbers)  # NameError: name 'numbers' is not defined`} />
                    </div>

                    <div className="p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500">
                        <h4 className="font-bold text-teal-800 mb-2">clear()</h4>
                        <p className="mb-2">Removes all elements from the list.</p>
                        <CodeBlock code={`fruits = ["apple", "banana", "cherry"]
fruits.clear()
print(fruits)  # Output: []`} />
                    </div>

                    <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                        <h4 className="font-bold text-indigo-800 mb-2">copy()</h4>
                        <p className="mb-2">Returns a shallow copy of the list.</p>
                        <CodeBlock code={`original = ["apple", "banana", "cherry"]
copied = original.copy()
copied.append("orange")
print(original)  # Output: ['apple', 'banana', 'cherry']
print(copied)    # Output: ['apple', 'banana', 'cherry', 'orange']`} />
                    </div>

                    <div className="p-4 bg-cyan-50 rounded-lg border-l-4 border-cyan-500">
                        <h4 className="font-bold text-cyan-800 mb-2">len()</h4>
                        <p className="mb-2">Returns the number of elements in the list.</p>
                        <CodeBlock code={`fruits = ["apple", "banana", "cherry", "orange"]
length = len(fruits)
print(length)  # Output: 4`} />
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                        <h4 className="font-bold text-yellow-800 mb-2">reverse()</h4>
                        <p className="mb-2">Reverses the order of elements in the list.</p>
                        <CodeBlock code={`fruits = ["apple", "banana", "cherry", "orange"]
fruits.reverse()
print(fruits)  # Output: ['orange', 'cherry', 'banana', 'apple']`} />
                    </div>

                    <div className="p-4 bg-pink-50 rounded-lg border-l-4 border-pink-500">
                        <h4 className="font-bold text-pink-800 mb-2">sort()</h4>
                        <p className="mb-2">Sorts the elements of the list in ascending order by default.</p>
                        <CodeBlock code={`fruits = ["orange", "apple", "cherry", "banana"]
fruits.sort()
print(fruits)  # Output: ['apple', 'banana', 'cherry', 'orange']

# Sort in descending order
numbers = [5, 2, 8, 1, 9]
numbers.sort(reverse=True)
print(numbers)  # Output: [9, 8, 5, 2, 1]

# Sort with a custom key function
items = ["apple", "Banana", "Cherry", "orange"]
items.sort(key=str.lower)  # Case-insensitive sort
print(items)  # Output: ['apple', 'Banana', 'Cherry', 'orange']`} />
                    </div>
                </div>
            </Section>

            {/* ── List Comprehension ── */}
            <Section title="List Comprehension">
                <p>List comprehensions provide a concise way to create lists based on existing lists or other iterables.</p>
                <CodeBlock code={`# Basic list comprehension
squares = [x**2 for x in range(6)]
# [0, 1, 4, 9, 16, 25]

# With condition
evens = [x for x in range(20) if x % 2 == 0]
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# Nested list comprehension
matrix = [[i*j for j in range(1,4)] for i in range(1,4)]
# [[1, 2, 3], [2, 4, 6], [3, 6, 9]]`} />
            </Section>
        </ContentPage>
    );
}
