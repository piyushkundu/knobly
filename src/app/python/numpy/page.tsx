'use client';
import ContentPage, { CodeBlock, Section } from '@/components/content/ContentPage';

export default function NumPyPage() {
    return (
        <ContentPage title="NumPy" breadcrumb={{ label: 'Python', href: '/python' }}>
            <Section title="Introduction">
                <CodeBlock code={`import numpy as np

# Creating arrays
a = np.array([1, 2, 3, 4, 5])
b = np.zeros((3, 3))
c = np.ones((2, 4))
d = np.arange(0, 10, 2)  # [0, 2, 4, 6, 8]
e = np.linspace(0, 1, 5) # [0, 0.25, 0.5, 0.75, 1]`} />
            </Section>
            <Section title="Array Operations">
                <CodeBlock code={`a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

print(a + b)     # [5, 7, 9]
print(a * b)     # [4, 10, 18]
print(a ** 2)    # [1, 4, 9]
print(np.dot(a, b))  # 32`} />
            </Section>
            <Section title="Indexing & Slicing">
                <CodeBlock code={`arr = np.array([[1,2,3],[4,5,6],[7,8,9]])
print(arr[0, 1])     # 2
print(arr[:, 1])     # [2, 5, 8] (column)
print(arr[1, :])     # [4, 5, 6] (row)
print(arr[0:2, 1:3]) # [[2,3],[5,6]]`} />
            </Section>
            <Section title="Statistics">
                <CodeBlock code={`data = np.array([10, 20, 30, 40, 50])
print(np.mean(data))    # 30.0
print(np.median(data))  # 30.0
print(np.std(data))     # 14.14
print(np.min(data))     # 10
print(np.max(data))     # 50
print(np.sum(data))     # 150`} />
            </Section>
        </ContentPage>
    );
}
