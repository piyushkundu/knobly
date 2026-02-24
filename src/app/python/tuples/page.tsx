'use client';
import ContentPage, { CodeBlock, Section, InfoBox } from '@/components/content/ContentPage';

export default function TuplesPage() {
    return (
        <ContentPage title="Python Tuples" breadcrumb={{ label: 'Python', href: '/python' }}>

            {/* ── What is a Tuple? ── */}
            <Section title="What is a Tuple?">
                <p>A tuple is an <strong>immutable</strong>, ordered collection of elements in Python. Once created, its contents cannot be modified. Tuples are similar to lists but with the key difference that tuples cannot be changed after creation.</p>

                <InfoBox type="tip">Use tuples when you want to store data that should not be modified, like coordinates, days of the week, or database records.</InfoBox>
            </Section>

            {/* ── Types of Tuples ── */}
            <Section title="Types of Tuples">
                <CodeBlock code={`# Empty Tuple
empty_tuple = ()

# Tuple of Integers
int_tuple = (1, 2, 3, 4)

# Tuple of Floating Point Numbers
float_tuple = (1.1, 2.2, 3.3)

# Tuple of Characters
char_tuple = ('a', 'b', 'c')

# Tuple of Strings
str_tuple = ('hello', 'world', 'python')

# Mixed Value Tuple
mixed_tuple = (1, 'hello', 3.14, True)`} />
            </Section>

            {/* ── Creating Tuples ── */}
            <Section title="Creating Tuples">
                <h3 className="text-lg font-semibold mt-2 mb-2">Method 1: Direct Assignment</h3>
                <CodeBlock code={`my_tuple = (1, 2, 3)
single = (5,)  # Note the comma! Without it, (5) is just an integer`} />

                <h3 className="text-lg font-semibold mt-4 mb-2">Method 2: From Another Sequence</h3>
                <CodeBlock code={`# Convert a list to tuple
list_to_tuple = tuple([1, 2, 3])
print(list_to_tuple)  # (1, 2, 3)

# Convert a string to tuple
str_to_tuple = tuple("Python")
print(str_to_tuple)  # ('P', 'y', 't', 'h', 'o', 'n')

# Convert a range to tuple
range_to_tuple = tuple(range(1, 6))
print(range_to_tuple)  # (1, 2, 3, 4, 5)`} />

                <h3 className="text-lg font-semibold mt-4 mb-2">Method 3: Dynamic Input</h3>
                <CodeBlock code={`# Create tuple from user input
dynamic_tuple = tuple(input("Enter tuple elements: ").split())
print(dynamic_tuple)`} />

                <InfoBox type="note">A single-element tuple requires a trailing comma: <code>(5,)</code>. Without the comma, <code>(5)</code> is just the integer 5 in parentheses.</InfoBox>
            </Section>

            {/* ── Accessing Tuples ── */}
            <Section title="Accessing Tuples">
                <h3 className="text-lg font-semibold mt-2 mb-2">Whole Tuple Access</h3>
                <CodeBlock code={`full_tuple = (1, 2, 3, 4, 5)
print(full_tuple)  # Prints entire tuple: (1, 2, 3, 4, 5)`} />

                <h3 className="text-lg font-semibold mt-4 mb-2">Individual Element Access</h3>
                <CodeBlock code={`full_tuple = (1, 2, 3, 4, 5)

# Positive index (from beginning)
first_element = full_tuple[0]   # 1
third_element = full_tuple[2]   # 3

# Negative index (from end)
last_element = full_tuple[-1]   # 5
second_last = full_tuple[-2]    # 4

print(first_element, last_element)  # 1 5`} />

                <h3 className="text-lg font-semibold mt-4 mb-2">Slicing Tuples</h3>
                <CodeBlock code={`t = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)

print(t[2:6])    # (2, 3, 4, 5)
print(t[:4])     # (0, 1, 2, 3)
print(t[5:])     # (5, 6, 7, 8, 9)
print(t[::2])    # (0, 2, 4, 6, 8)
print(t[::-1])   # (9, 8, 7, 6, 5, 4, 3, 2, 1, 0)`} />
            </Section>

            {/* ── Tuple Operations ── */}
            <Section title="Tuple Operations">
                <h3 className="text-lg font-semibold mt-2 mb-2">Combining Tuples (Concatenation)</h3>
                <CodeBlock code={`tuple1 = (1, 2)
tuple2 = (3, 4)
combined_tuple = tuple1 + tuple2  # (1, 2, 3, 4)
print(combined_tuple)`} />

                <h3 className="text-lg font-semibold mt-4 mb-2">Replicating Tuples</h3>
                <CodeBlock code={`tuple1 = (1, 2)
repeated_tuple = tuple1 * 3  # (1, 2, 1, 2, 1, 2)
print(repeated_tuple)`} />

                <h3 className="text-lg font-semibold mt-4 mb-2">Slicing</h3>
                <CodeBlock code={`full_tuple = (1, 2, 3, 4, 5)
subset = full_tuple[1:4]  # Select elements from index 1 to 3
print(subset)  # (2, 3, 4)`} />

                <h3 className="text-lg font-semibold mt-4 mb-2">Membership Test</h3>
                <CodeBlock code={`t = (1, 2, 3, 4, 5)
print(3 in t)      # True
print(10 not in t)  # True`} />
            </Section>

            {/* ── Tuple Functions ── */}
            <Section title="Tuple Functions">
                <CodeBlock code={`tuple_example = (5, 2, 8, 1, 9)

# Length of Tuple
print(len(tuple_example))  # 5

# Maximum Value
print(max(tuple_example))  # 9

# Minimum Value
print(min(tuple_example))  # 1

# Sum of Tuple
print(sum(tuple_example))  # 25

# Count Occurrences
print(tuple_example.count(2))  # 1

# Index of First Occurrence
print(tuple_example.index(8))  # 2`} />

                <InfoBox type="note">Tuples only have two methods: <code>count()</code> and <code>index()</code>. This is because tuples are immutable — they cannot be modified after creation.</InfoBox>
            </Section>

            {/* ── Packing & Unpacking ── */}
            <Section title="Packing & Unpacking">
                <h3 className="text-lg font-semibold mt-2 mb-2">Tuple Packing</h3>
                <p>Creating a tuple by assigning multiple values to a single variable.</p>
                <CodeBlock code={`# Packing - parentheses are optional
coords = 10, 20, 30
print(coords)       # (10, 20, 30)
print(type(coords)) # <class 'tuple'>`} />

                <h3 className="text-lg font-semibold mt-4 mb-2">Tuple Unpacking</h3>
                <p>Assigning tuple elements to individual variables.</p>
                <CodeBlock code={`# Unpacking
coords = (10, 20, 30)
x, y, z = coords
print(x, y, z)  # 10 20 30

# Swap values using tuple unpacking
a, b = 5, 10
a, b = b, a
print(a, b)  # 10 5

# Extended unpacking with *
first, *rest = (1, 2, 3, 4, 5)
print(first)  # 1
print(rest)   # [2, 3, 4, 5]`} />
            </Section>

            {/* ── Tuple vs List ── */}
            <Section title="Tuple vs List">
                <div className="overflow-x-auto my-4">
                    <table className="w-full text-sm border-collapse">
                        <thead><tr className="bg-blue-600 text-white"><th className="p-3 text-left">Feature</th><th className="p-3 text-left">Tuple</th><th className="p-3 text-left">List</th></tr></thead>
                        <tbody>
                            <tr className="border-b"><td className="p-3 font-bold">Syntax</td><td className="p-3 font-mono">(1, 2, 3)</td><td className="p-3 font-mono">[1, 2, 3]</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-3 font-bold">Mutability</td><td className="p-3">Immutable (cannot change)</td><td className="p-3">Mutable (can change)</td></tr>
                            <tr className="border-b"><td className="p-3 font-bold">Speed</td><td className="p-3">Faster</td><td className="p-3">Slower</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-3 font-bold">Memory</td><td className="p-3">Uses less memory</td><td className="p-3">Uses more memory</td></tr>
                            <tr className="border-b"><td className="p-3 font-bold">Methods</td><td className="p-3">count(), index() only</td><td className="p-3">Many methods available</td></tr>
                            <tr className="border-b bg-gray-50"><td className="p-3 font-bold">Use Case</td><td className="p-3">Fixed data (coordinates, etc.)</td><td className="p-3">Dynamic data collections</td></tr>
                        </tbody>
                    </table>
                </div>
            </Section>
        </ContentPage>
    );
}
