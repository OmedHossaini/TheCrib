import math

# Basic calculator operations
def add(x, y):
    return x + y

def subtract(x, y):
    return x - y

def multiply(x, y):
    return x * y

def divide(x, y):
    if y == 0:
        return "Error: Cannot divide by zero."
    return x / y

# Advanced calculator operations
def factorial(n):
    if n < 0:
        return "Error: Factorial of negative numbers is not defined."
    return math.factorial(n)

def power(x, y):
    return x ** y

def logarithm(x, base=math.e):
    if x <= 0:
        return "Error: Logarithm is not defined for non-positive numbers."
    return math.log(x, base)

def sine(x):
    return math.sin(math.radians(x))

def cosine(x):
    return math.cos(math.radians(x))

def tangent(x):
    return math.tan(math.radians(x))

# Area calculation functions
def calculate_circle_area(radius):
    return math.pi * radius ** 2

def calculate_rectangle_area(length, width):
    return length * width

def calculate_triangle_area(base, height):
    return 0.5 * base * height

# Custom error handling and input
def get_number(prompt):
    try:
        return float(input(prompt))
    except ValueError:
        return "Error: Invalid input. Please enter a valid number."

def calculator():
    print("===== Insane Python Calculator =====")
    print("Available operations:")
    print("1. Addition (+)")
    print("2. Subtraction (-)")
    print("3. Multiplication (*)")
    print("4. Division (/)")
    print("5. Factorial (!)")
    print("6. Power (x^y)")
    print("7. Logarithm (log)")
    print("8. Sine (sin)")
    print("9. Cosine (cos)")
    print("10. Tangent (tan)")
    print("11. Area Calculation (Circle, Rectangle, Triangle)")

    choice = input("Choose an operation (1-11): ")

    if choice in ['1', '2', '3', '4', '6']:
        num1 = get_number("Enter first number: ")
        num2 = get_number("Enter second number: ")

        if isinstance(num1, str) or isinstance(num2, str):
            print("Invalid number input.")
            return
        
        if choice == '1':
            print(f"{num1} + {num2} = {add(num1, num2)}")
        elif choice == '2':
            print(f"{num1} - {num2} = {subtract(num1, num2)}")
        elif choice == '3':
            print(f"{num1} * {num2} = {multiply(num1, num2)}")
        elif choice == '4':
            print(f"{num1} / {num2} = {divide(num1, num2)}")
        elif choice == '6':
            print(f"{num1}^{num2} = {power(num1, num2)}")

    elif choice == '5':
        num = get_number("Enter a number for factorial: ")
        if isinstance(num, str):
            print(num)
        else:
            print(f"{num}! = {factorial(int(num))}")

    elif choice == '7':
        num = get_number("Enter number for logarithm: ")
        base = get_number("Enter base (optional, default is e): ")
        if isinstance(num, str):
            print(num)
        else:
            print(f"log({num}) = {logarithm(num, base if base else math.e)}")

    elif choice == '8':
        num = get_number("Enter angle in degrees for sine: ")
        print(f"sin({num}) = {sine(num)}")

    elif choice == '9':
        num = get_number("Enter angle in degrees for cosine: ")
        print(f"cos({num}) = {cosine(num)}")

    elif choice == '10':
        num = get_number("Enter angle in degrees for tangent: ")
        print(f"tan({num}) = {tangent(num)}")

    elif choice == '11':
        # Area Calculation
        print("Choose a shape to calculate its area:")
        print("1. Circle")
        print("2. Rectangle")
        print("3. Triangle")

        shape_choice = input("Enter the number of your choice: ")

        if shape_choice == '1':
            radius = get_number("Enter the radius of the circle: ")
            if isinstance(radius, str):
                print(radius)
            else:
                area = calculate_circle_area(radius)
                print(f"The area of the circle is: {area:.2f}")

        elif shape_choice == '2':
            length = get_number("Enter the length of the rectangle: ")
            width = get_number("Enter the width of the rectangle: ")
            if isinstance(length, str) or isinstance(width, str):
                print("Invalid input.")
            else:
                area = calculate_rectangle_area(length, width)
                print(f"The area of the rectangle is: {area:.2f}")

        elif shape_choice == '3':
            base = get_number("Enter the base of the triangle: ")
            height = get_number("Enter the height of the triangle: ")
            if isinstance(base, str) or isinstance(height, str):
                print("Invalid input.")
            else:
                area = calculate_triangle_area(base, height)
                print(f"The area of the triangle is: {area:.2f}")
        else:
            print("Invalid choice. Please choose 1, 2, or 3.")
    
    else:
        print("Error: Invalid operation choice.")

# Run the calculator
calculator()
