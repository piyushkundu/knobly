'use client';
import ContentPage, { CodeBlock, Section } from '@/components/content/ContentPage';

export default function PythonFunctions() {
    return (
        <ContentPage title="Functions" breadcrumb={{ label: 'Python', href: '/python' }}>
            <Section title="Defining Functions">
                <CodeBlock code={`def greet(name):
    return f"Hello, {name}!"

print(greet("Knobly"))  # Hello, Knobly!`} />
            </Section>
            <Section title="Default & Keyword Arguments">
                <CodeBlock code={`def power(base, exp=2):
    return base ** exp

print(power(3))       # 9
print(power(2, 10))   # 1024
print(power(exp=3, base=5))  # 125`} />
            </Section>
            <Section title="*args and **kwargs">
                <CodeBlock code={`def total(*args):
    return sum(args)

print(total(1, 2, 3, 4))  # 10

def info(**kwargs):
    for key, val in kwargs.items():
        print(f"{key}: {val}")

info(name="Knobly", age=2, type="OS")`} />
            </Section>
            <Section title="Lambda Functions">
                <CodeBlock code={`square = lambda x: x ** 2
print(square(5))  # 25

nums = [1, 2, 3, 4, 5]
evens = list(filter(lambda x: x % 2 == 0, nums))
print(evens)  # [2, 4]`} />
            </Section>
            <Section title="Recursion">
                <CodeBlock code={`def factorial(n):
    if n <= 1: return 1
    return n * factorial(n - 1)

print(factorial(5))  # 120`} />
            </Section>
        </ContentPage>
    );
}
