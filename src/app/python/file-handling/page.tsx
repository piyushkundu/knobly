'use client';
import ContentPage, { CodeBlock, Section } from '@/components/content/ContentPage';

export default function FileHandling() {
    return (
        <ContentPage title="File Handling" breadcrumb={{ label: 'Python', href: '/python' }}>
            <Section title="Opening Files">
                <CodeBlock code={`# Modes: 'r' read, 'w' write, 'a' append, 'r+' read+write
f = open("data.txt", "r")
content = f.read()
f.close()

# Better: using 'with'
with open("data.txt", "r") as f:
    content = f.read()
    print(content)`} />
            </Section>
            <Section title="Reading Files">
                <CodeBlock code={`with open("data.txt", "r") as f:
    print(f.read())        # entire file
    print(f.readline())    # one line
    print(f.readlines())   # list of lines

    for line in f:
        print(line.strip())`} />
            </Section>
            <Section title="Writing Files">
                <CodeBlock code={`# Write (overwrites)
with open("output.txt", "w") as f:
    f.write("Hello Knobly!\\n")
    f.write("Second line")

# Append
with open("output.txt", "a") as f:
    f.write("\\nAppended text")`} />
            </Section>
            <Section title="CSV Files">
                <CodeBlock code={`import csv

# Reading CSV
with open("data.csv", "r") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)

# Writing CSV
with open("out.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["Name", "Age"])
    writer.writerow(["Knobly", 2])`} />
            </Section>
        </ContentPage>
    );
}
