---
title: "Chapter 2: Neural Network Fundamentals"
description: "Learn the core components of neural networks including neurons, activation functions, feedforward networks, loss functions, and optimization algorithms."
sidebar_position: 2
---

Neural networks are a foundational concept in artificial intelligence, designed to mimic the human brain's ability to learn and make decisions. For beginners, understanding a few core components is key:

### Neuron Model
At its heart, a neural network is made up of interconnected "neurons," or perceptrons. Think of a neuron as a tiny decision-making unit. Each neuron receives inputs, much like dendrites in a biological neuron. These inputs are multiplied by numerical "weights," which represent the strength of the connection. A "bias" value is then added to this weighted sum. Finally, an "activation function" processes this result, deciding whether the neuron "fires" or activates, passing its output to the next layer of neurons. Neural networks typically arrange these neurons into an **input layer**, one or more **hidden layers**, and an **output layer**.

### Activation Functions
Activation functions are crucial for allowing neural networks to learn complex patterns. Without them, a network would only be able to learn simple, linear relationships.

*   **Sigmoid Function**: This function squashes any input value into a range between 0 and 1, creating an S-shaped curve. It's often used when the output needs to be interpreted as a probability, such as in binary classification tasks (e.g., spam or not spam).
*   **Tanh (Hyperbolic Tangent) Function**: Similar to Sigmoid, Tanh maps inputs to a range between -1 and 1. Being "zero-centered" can sometimes help neural networks converge faster during training and lead to more stable gradient updates.
*   **ReLU (Rectified Linear Unit) Function**: A very popular choice, ReLU outputs 0 for any negative input and the input value itself for any positive input. Its simplicity makes it computationally efficient, helping with faster training. It also helps mitigate a problem called "vanishing gradients" compared to Sigmoid or Tanh, though it can suffer from "dead neurons" if inputs are consistently negative.

### Feedforward Networks
Feedforward neural networks are the simplest type, where information flows in one direction: from the input layer, through any hidden layers, to the output layer, without any loops.

*   **Perceptrons**: The most basic form of a neural network, consisting of a single layer of neurons. Perceptrons can solve problems where the data can be separated by a straight line (linearly separable problems), making them suitable for simple classification tasks.
*   **Multilayer Perceptrons (MLPs)**: These are more powerful feedforward networks that include one or more hidden layers between the input and output layers. The hidden layers, combined with non-linear activation functions, allow MLPs to learn and represent much more complex, non-linear relationships in data. They are considered universal function approximators, capable of approximating any continuous function. Training MLPs often involves an algorithm called "backpropagation" to adjust the weights and improve accuracy.

### Loss Functions
Loss functions (also known as cost functions or error functions) are like a scorecard for a neural network. They quantify how far off a model's predictions are from the actual correct values. The goal of training is to minimize this loss.

*   **Mean Squared Error (MSE)**: This function calculates the average of the squared differences between the predicted values and the actual target values. It's primarily used for **regression tasks**, where the model predicts continuous numerical values (e.g., predicting house prices). MSE heavily penalizes large errors due to the squaring, making the model sensitive to significant mistakes.
*   **Cross-Entropy Loss**: This is the preferred loss function for **classification tasks**, where the model predicts probabilities for different categories (e.g., classifying an image as a cat or a dog). Cross-entropy measures the dissimilarity between the predicted probability distribution and the true distribution of labels, encouraging the model to assign high probabilities to the correct classes.

### Optimization Algorithms
Optimization algorithms are methods used to adjust the weights and biases of a neural network to minimize the loss function during training. They guide the model to learn from its errors.

*   **Gradient Descent (GD)**: Imagine being in a mountainous landscape and wanting to find the lowest valley (the minimum loss). Gradient Descent takes steps proportional to the negative of the "gradient" (which indicates the steepest direction of ascent) of the loss function. It calculates this gradient using the *entire* training dataset before updating the model's parameters. While it guarantees convergence to a minimum under ideal conditions, it can be very slow for large datasets.
*   **Stochastic Gradient Descent (SGD)**: To speed things up, SGD introduces randomness. Instead of using the entire dataset, SGD updates the model's parameters using the gradient calculated from *just one randomly selected training example* or a small "mini-batch" of examples at a time. This results in much faster updates, especially for large datasets. While SGD's path to the minimum can be "noisy" and might oscillate around the lowest point, it often reaches a good solution more quickly and can sometimes escape shallow local minima that GD might get stuck in.
