'use client';
import ContentPage, { CodeBlock, Section, InfoBox } from '@/components/content/ContentPage';
import { GitBranch, Repeat, Zap, ArrowRight, FileText, ExternalLink, Sparkles, ShieldCheck, Code2, Terminal, ChevronRight } from 'lucide-react';

export default function ControlStatements() {
    return (
        <ContentPage title="Python Control Statements" breadcrumb={{ label: 'Python', href: '/python' }}>

            {/* ── Hero Banner — uses inline styles only so light-mode !important overrides won't affect ── */}
            <div className="relative overflow-hidden rounded-2xl mb-6" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%)' }}>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #c084fc 0%, transparent 70%)', transform: 'translate(-20%, 30%)' }} />
                <div className="relative z-10 p-6 md:p-8">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                            <GitBranch size={28} style={{ color: '#ffffff' }} />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-lg" style={{ color: '#ffffff' }}>Control Statements</h2>
                            <p className="text-sm font-medium mt-1" style={{ color: '#c7d2fe' }}>Chapter 2 • Python Programming</p>
                        </div>
                    </div>
                    <p className="text-base leading-relaxed max-w-2xl mb-5" style={{ color: '#e0e7ff' }}>
                        Master program flow control in Python — from conditional logic and loops to jump statements and logical operators.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: 'if / elif / else', icon: '🔀' },
                            { label: 'while & for Loops', icon: '🔄' },
                            { label: 'break / continue', icon: '⚡' },
                            { label: 'Logical Operators', icon: '🧠' },
                        ].map(tag => (
                            <span key={tag.label} className="px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff' }}>
                                <span>{tag.icon}</span> {tag.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Introduction ── */}
            <Section title="Introduction to Control Statements">
                <p>Control statements are fundamental building blocks that determine how your program executes. They allow you to:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {[
                        { icon: <GitBranch size={18} style={{ color: '#93c5fd' }} />, label: 'Make decisions based on conditions', bg: '#1e3a5f', border: '#3b82f6' },
                        { icon: <Repeat size={18} style={{ color: '#c4b5fd' }} />, label: 'Execute code repeatedly', bg: '#3b1f5e', border: '#8b5cf6' },
                        { icon: <ArrowRight size={18} style={{ color: '#67e8f9' }} />, label: 'Control program flow', bg: '#134e4a', border: '#06b6d4' },
                        { icon: <ShieldCheck size={18} style={{ color: '#86efac' }} />, label: 'Handle different scenarios effectively', bg: '#14532d', border: '#22c55e' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: item.bg, border: `1px solid ${item.border}40` }}>
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${item.border}30` }}>
                                {item.icon}
                            </div>
                            <span className="text-sm font-medium" style={{ color: '#ffffff' }}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </Section>

            {/* ── Conditional Statements ── */}
            <Section title="Conditional Statements">
                <div className="space-y-6">
                    {/* Simple if */}
                    <div>
                        <h3 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: '#3b82f6' }}>
                            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff' }}>1</span>
                            Simple if Statement
                        </h3>
                        <p>Used when you need to execute code only if a specific condition is True.</p>
                        <CodeBlock code={`# Check if a number is positive
number = 10
if number > 0:
    print(f"{number} is positive")`} />
                        <CodeBlock code={`# Check if a string is empty
text = ""
if not text:
    print("The string is empty")`} />
                    </div>

                    {/* if-else */}
                    <div>
                        <h3 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: '#8b5cf6' }}>
                            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#ffffff' }}>2</span>
                            if-else Statement
                        </h3>
                        <p>Used when you need to handle two alternative scenarios.</p>
                        <CodeBlock code={`# Check if a number is even or odd
number = 15
if number % 2 == 0:
    print(f"{number} is even")
else:
    print(f"{number} is odd")`} />
                    </div>

                    {/* if-elif-else */}
                    <div>
                        <h3 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: '#0891b2' }}>
                            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: '#ffffff' }}>3</span>
                            if-elif-else Statement
                        </h3>
                        <p>Used when you need to handle multiple conditions.</p>
                        <CodeBlock code={`# Grade calculator
score = 85
if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
elif score >= 70:
    print("Grade: C")
elif score >= 60:
    print("Grade: D")
else:
    print("Grade: F")`} />
                    </div>

                    {/* Nested if */}
                    <div>
                        <h3 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: '#d97706' }}>
                            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#ffffff' }}>4</span>
                            Nested if Statements
                        </h3>
                        <p>Used when you need to check conditions within conditions.</p>
                        <CodeBlock code={`# Online purchase eligibility checker
age = 25
has_id = True
has_funds = True

if age >= 18:
    if has_id:
        if has_funds:
            print("Purchase approved!")
        else:
            print("Insufficient funds")
    else:
        print("ID verification required")
else:
    print("Age restriction: Must be 18 or older")`} />
                        <InfoBox type="tip">While nested if statements are powerful, consider using logical operators (and/or) when possible to make your code more readable.</InfoBox>
                    </div>
                </div>
            </Section>

            {/* ── Complex Conditions ── */}
            <Section title="Complex Conditions">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-base font-bold mb-2" style={{ color: '#7c3aed' }}>Logical Operators (and, or)</h3>
                        <p>Logical operators allow you to combine multiple conditions in a single statement, often making your code more concise and readable than nested if statements.</p>
                    </div>

                    {/* AND */}
                    <div className="pl-4 rounded-lg" style={{ borderLeft: '3px solid #6366f1' }}>
                        <h4 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#4f46e5' }}>
                            <Sparkles size={14} style={{ color: '#6366f1' }} /> Logical AND (and)
                        </h4>
                        <p>The <code style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>and</code> operator returns <code style={{ background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>True</code> only if both conditions are <code style={{ background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>True</code>.</p>
                        <CodeBlock code={`# Online purchase eligibility checker (using logical AND)
age = 25
has_id = True
has_funds = True

if age >= 18 and has_id and has_funds:
    print("Purchase approved!")
elif age >= 18 and has_id and not has_funds:
    print("Insufficient funds")
elif age >= 18 and not has_id:
    print("ID verification required")
else:
    print("Age restriction: Must be 18 or older")`} />
                    </div>

                    {/* OR */}
                    <div className="pl-4 rounded-lg" style={{ borderLeft: '3px solid #a855f7' }}>
                        <h4 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#7c3aed' }}>
                            <Sparkles size={14} style={{ color: '#a855f7' }} /> Logical OR (or)
                        </h4>
                        <p>The <code style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>or</code> operator returns <code style={{ background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>True</code> if at least one condition is <code style={{ background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>True</code>.</p>
                        <CodeBlock code={`# Discount eligibility checker
is_student = False
is_senior = True
is_member = False

if is_student or is_senior or is_member:
    print("Discount applied!")
else:
    print("No discount available")`} />
                    </div>

                    {/* ✅ Practice Link 1 */}
                    <a href="https://drive.google.com/file/d/1oabLlgig0-zgY_dtcdD-0d8k1ZNk5dEp/view?usp=sharing" target="_blank" rel="noopener noreferrer"
                        className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.01]"
                        style={{ background: 'linear-gradient(135deg, #451a03, #78350f)', border: '1px solid #92400e' }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                            <FileText size={20} style={{ color: '#ffffff' }} />
                        </div>
                        <div className="flex-1">
                            <span className="text-sm font-bold" style={{ color: '#fef3c7' }}>📝 Practice Questions</span>
                            <p className="text-[11px] mt-0.5" style={{ color: '#fbbf24' }}>Conditional Statements • Google Drive</p>
                        </div>
                        <ChevronRight size={18} style={{ color: '#f59e0b' }} />
                    </a>

                    {/* Combining AND and OR */}
                    <div className="pl-4 rounded-lg" style={{ borderLeft: '3px solid #06b6d4' }}>
                        <h4 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#0891b2' }}>
                            <Sparkles size={14} style={{ color: '#06b6d4' }} /> Combining AND and OR
                        </h4>
                        <p>You can combine different logical operators to create complex conditions.</p>
                        <CodeBlock code={`# Ticket pricing system
age = 65
is_weekend = True
has_discount_code = False

# Regular price: $12
# Discounted price: $8
# Free entry for children under 5

if age < 5:
    price = 0
elif (age < 18 or age >= 60) and not is_weekend:
    # Discount for youth and seniors on weekdays
    price = 8
elif has_discount_code:
    # Discount for anyone with a code
    price = 8
else:
    # Regular price for everyone else
    price = 12

print(f"Ticket price: \${price}")`} />
                        <InfoBox type="tip">Use parentheses to make complex logical expressions clearer and to control the order of evaluation. For example: <code style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>(condition1 and condition2) or condition3</code> is different from <code style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>condition1 and (condition2 or condition3)</code>.</InfoBox>
                    </div>

                    {/* Short-Circuit */}
                    <div className="pl-4 rounded-lg" style={{ borderLeft: '3px solid #10b981' }}>
                        <h4 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#059669' }}>
                            <Zap size={14} style={{ color: '#10b981' }} /> Short-Circuit Evaluation
                        </h4>
                        <p>Python uses short-circuit evaluation with logical operators, which means it stops evaluating as soon as the result is determined.</p>
                        <CodeBlock code={`# Short-circuit evaluation demonstration
def check_a():
    print("Checking condition A")
    return False

def check_b():
    print("Checking condition B")
    return True

# With AND operator
print("\\nUsing AND operator:")
result = check_a() and check_b()  # check_b() won't be called
print(f"Result: {result}")

# With OR operator
print("\\nUsing OR operator:")
result = check_b() or check_a()  # check_a() won't be called
print(f"Result: {result}")`} />
                    </div>
                </div>
            </Section>

            {/* ── Looping Statements ── */}
            <Section title="Looping Statements">
                <div className="space-y-6">
                    {/* while */}
                    <div>
                        <h3 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: '#0d9488' }}>
                            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: '#ffffff' }}>1</span>
                            while Loop
                        </h3>
                        <p>Used when you need to repeat code while a condition is True.</p>
                        <CodeBlock code={`# Countdown timer
countdown = 5
while countdown > 0:
    print(f"Time remaining: {countdown}")
    countdown -= 1
print("Blast off! 🚀")`} />
                    </div>

                    {/* ✅ Practice Link 2 */}
                    <a href="https://drive.google.com/file/d/1kEDXXt0gpKMEaGHKJUxp7MXUzgtX_x7_/view?usp=sharing" target="_blank" rel="noopener noreferrer"
                        className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.01]"
                        style={{ background: 'linear-gradient(135deg, #451a03, #78350f)', border: '1px solid #92400e' }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                            <FileText size={20} style={{ color: '#ffffff' }} />
                        </div>
                        <div className="flex-1">
                            <span className="text-sm font-bold" style={{ color: '#fef3c7' }}>📝 Practice Questions</span>
                            <p className="text-[11px] mt-0.5" style={{ color: '#fbbf24' }}>while Loop • Google Drive</p>
                        </div>
                        <ChevronRight size={18} style={{ color: '#f59e0b' }} />
                    </a>

                    {/* for */}
                    <div>
                        <h3 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: '#7c3aed' }}>
                            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#ffffff' }}>2</span>
                            for Loop
                        </h3>
                        <p>Used when you need to iterate over a sequence.</p>
                        <CodeBlock code={`# Calculate total from a list
prices = [10, 20, 30, 40]
total = 0
for price in prices:
    total += price
print(f"Total: \${total}")`} />
                        <CodeBlock code={`# Print multiplication table
number = 5
for i in range(1, 6):
    print(f"{number} x {i} = {number * i}")`} />
                    </div>
                </div>
            </Section>

            {/* ── Jump Statements ── */}
            <Section title="Jump Statements">
                <div className="space-y-6">
                    {/* break */}
                    <div>
                        <h3 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: '#e11d48' }}>
                            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: '#ffffff' }}>1</span>
                            break Statement
                        </h3>
                        <p>Used to exit a loop prematurely.</p>
                        <CodeBlock code={`# Find first even number
numbers = [1, 3, 5, 6, 7, 8]
for num in numbers:
    if num % 2 == 0:
        print(f"First even number found: {num}")
        break`} />
                    </div>

                    {/* continue */}
                    <div>
                        <h3 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: '#0284c7' }}>
                            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#ffffff' }}>2</span>
                            continue Statement
                        </h3>
                        <p>Used to skip the rest of the current iteration.</p>
                        <CodeBlock code={`# Print only odd numbers
for i in range(5):
    if i % 2 == 0:
        continue
    print(f"Odd number: {i}")`} />
                    </div>

                    {/* Loop with else */}
                    <div>
                        <h3 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: '#059669' }}>
                            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff' }}>3</span>
                            Loop with else
                        </h3>
                        <p>The else block executes when the loop completes normally (without break).</p>
                        <CodeBlock code={`# Check for prime number
number = 13
for i in range(2, number):
    if number % i == 0:
        print(f"{number} is not prime")
        break
else:
    print(f"{number} is prime")`} />
                    </div>
                </div>
            </Section>

            {/* ✅ Practice Links 3 & 4 */}
            <Section title="Practice Questions">
                <p>Test your understanding of control statements with these practice exercises:</p>
                <div className="space-y-3 mt-3">
                    <a href="https://drive.google.com/file/d/12SbyovioK_dhr_CHK7XmX8FdjEs7ErVH/view?usp=sharing" target="_blank" rel="noopener noreferrer"
                        className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.01]"
                        style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid #4338ca' }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                            <span className="text-sm font-extrabold" style={{ color: '#ffffff' }}>1</span>
                        </div>
                        <div className="flex-1">
                            <span className="text-sm font-bold" style={{ color: '#c7d2fe' }}>Practice Questions — Set 1</span>
                            <p className="text-[11px] mt-0.5" style={{ color: '#818cf8' }}>Control Statements • Google Drive PDF</p>
                        </div>
                        <ExternalLink size={16} style={{ color: '#818cf8' }} />
                    </a>
                    <a href="https://drive.google.com/file/d/1KjIDFp4zXaKrw6nDQOQ5QrSFsVRdPKdx/view?usp=sharing" target="_blank" rel="noopener noreferrer"
                        className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.01]"
                        style={{ background: 'linear-gradient(135deg, #2e1065, #4c1d95)', border: '1px solid #6d28d9' }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #a855f7, #c026d3)' }}>
                            <span className="text-sm font-extrabold" style={{ color: '#ffffff' }}>2</span>
                        </div>
                        <div className="flex-1">
                            <span className="text-sm font-bold" style={{ color: '#e9d5ff' }}>Practice Questions — Set 2</span>
                            <p className="text-[11px] mt-0.5" style={{ color: '#c084fc' }}>Control Statements • Google Drive PDF</p>
                        </div>
                        <ExternalLink size={16} style={{ color: '#c084fc' }} />
                    </a>
                </div>
            </Section>

            {/* ── Pattern Programs ── */}
            <Section title="Pattern Programs">
                <CodeBlock code={`# Right triangle
n = 5
for i in range(1, n+1):
    print("* " * i)
# *
# * *
# * * *
# * * * *
# * * * * *`} />
            </Section>
        </ContentPage>
    );
}
