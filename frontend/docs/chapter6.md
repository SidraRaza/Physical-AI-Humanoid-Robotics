---
title: "Chapter 6: Learning for Robotics"
description: "Apply machine learning and reinforcement learning to physical agents."
sidebar_position: 6
---

# Learning for Robotics

Machine learning has revolutionized robotics, enabling robots to acquire skills that are difficult or impossible to program explicitly. This chapter explores how learning algorithms are applied to physical AI systems, from perception to control.

## Introduction to Robot Learning

### Why Learning?

Traditional robotics relies on explicit programming, but many tasks are:

- **Too Complex**: Cannot enumerate all situations
- **Environment-Dependent**: Require adaptation
- **Skill-Based**: Better learned than designed
- **Data-Rich**: Can leverage experience

### Learning Paradigms

```
┌─────────────────────────────────────────────────────────────┐
│                  Robot Learning Paradigms                    │
├──────────────────┬──────────────────┬───────────────────────┤
│   Supervised     │   Reinforcement  │    Self-Supervised    │
│   Learning       │   Learning       │    Learning           │
├──────────────────┼──────────────────┼───────────────────────┤
│ Human provides   │ Robot explores,  │ Robot generates own   │
│ labeled examples │ receives rewards │ supervision signals   │
├──────────────────┼──────────────────┼───────────────────────┤
│ • Classification │ • Policy learning│ • Contrastive learning│
│ • Regression     │ • Value learning │ • Prediction tasks    │
│ • Imitation      │ • Model learning │ • World models        │
└──────────────────┴──────────────────┴───────────────────────┘
```

## Imitation Learning

### Learning from Demonstrations

Robots learn by observing human demonstrations:

**Behavioral Cloning (BC)**
Direct supervised learning on state-action pairs:

```python
# Collect demonstrations
demonstrations = []
for episode in human_demonstrations:
    for (state, action) in episode:
        demonstrations.append((state, action))

# Train policy network
policy = NeuralNetwork()
optimizer = Adam(policy.parameters())

for batch in DataLoader(demonstrations):
    states, actions = batch
    predicted_actions = policy(states)
    loss = mse_loss(predicted_actions, actions)
    loss.backward()
    optimizer.step()
```

**Limitations of BC:**
- Distribution shift: Robot may encounter unseen states
- Compounding errors: Small mistakes accumulate
- No recovery behavior: Demonstrations show success only

### DAgger (Dataset Aggregation)

Addresses distribution shift by iteratively collecting data:

```
Algorithm DAgger:
1. Train initial policy π₁ on human demonstrations D
2. For iteration n = 1 to N:
   a. Execute policy πₙ to collect trajectories
   b. Query human expert for correct actions
   c. Add new (state, expert_action) to D
   d. Train πₙ₊₁ on aggregated dataset D
```

### Inverse Reinforcement Learning (IRL)

Learn the reward function from demonstrations:

```
Given: Expert demonstrations
Learn: Reward function R(s, a)
Then: Use R to train optimal policy

Key insight: The expert's behavior implies their reward function
```

**Maximum Entropy IRL:**
Assumes expert is optimal with some randomness, finds reward that explains demonstrations while maximizing entropy.

## Reinforcement Learning

### RL Fundamentals

The robot learns through trial and error:

```
┌─────────┐    action a    ┌─────────────┐
│  Agent  │ ─────────────► │ Environment │
│ (Robot) │                │   (World)   │
│         │ ◄───────────── │             │
└─────────┘  state s,      └─────────────┘
             reward r

Goal: Maximize cumulative reward
V(s) = E[Σ γᵗ r_t | s₀ = s]
```

### Policy Gradient Methods

Directly optimize the policy:

**REINFORCE Algorithm:**
```python
def reinforce_update(policy, trajectories):
    policy_loss = 0

    for trajectory in trajectories:
        returns = compute_returns(trajectory.rewards, gamma)

        for t, (state, action, ret) in enumerate(zip(
            trajectory.states,
            trajectory.actions,
            returns
        )):
            log_prob = policy.log_prob(state, action)
            policy_loss -= log_prob * ret

    policy_loss /= len(trajectories)
    policy_loss.backward()
    optimizer.step()
```

### Proximal Policy Optimization (PPO)

State-of-the-art policy gradient method:

**Key Ideas:**
- Clipped surrogate objective for stable updates
- Multiple epochs per batch of experience
- Trust region without complex constraints

```python
def ppo_loss(old_log_probs, new_log_probs, advantages, clip_range=0.2):
    ratio = torch.exp(new_log_probs - old_log_probs)

    # Clipped objective
    clipped_ratio = torch.clamp(ratio, 1 - clip_range, 1 + clip_range)

    loss = -torch.min(
        ratio * advantages,
        clipped_ratio * advantages
    ).mean()

    return loss
```

### Soft Actor-Critic (SAC)

Off-policy algorithm with entropy regularization:

**Objective:**
```
J(π) = Σ E[r(s,a) + α H(π(·|s))]

Where H is entropy, encouraging exploration
```

**Benefits:**
- Sample efficient (off-policy)
- Robust exploration
- Stable training

### Model-Based RL

Learn a model of the environment:

```
┌────────────────────────────────────────────────────────────┐
│               Model-Based RL Pipeline                       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Real Experience ──► Learn Dynamics Model ──►               │
│                     s_{t+1} = f(s_t, a_t)                   │
│                                                             │
│  Use Model for:                                             │
│  • Planning (MPC)                                           │
│  • Generating synthetic experience                          │
│  • Policy optimization                                      │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Advantages:**
- Sample efficient
- Better generalization
- Interpretable

**Challenges:**
- Model errors compound
- Complex dynamics hard to learn

## Sim-to-Real Transfer

### The Reality Gap

Policies trained in simulation often fail in reality due to:

- **Visual differences**: Rendering vs. real images
- **Dynamics differences**: Simplified physics
- **Sensor noise**: Idealized sensors in sim
- **Unmodeled effects**: Friction, backlash, delays

### Domain Randomization

Randomize simulation parameters during training:

```python
class RandomizedEnvironment:
    def reset(self):
        # Randomize physics
        self.friction = np.random.uniform(0.5, 1.5)
        self.mass_scale = np.random.uniform(0.8, 1.2)
        self.motor_strength = np.random.uniform(0.9, 1.1)

        # Randomize visuals
        self.lighting = np.random.uniform(0.5, 1.5)
        self.texture_id = np.random.randint(0, 100)
        self.camera_noise = np.random.uniform(0, 0.1)

        # Randomize timing
        self.action_delay = np.random.randint(0, 3)

        return self.get_observation()
```

### Domain Adaptation

Adapt representations across domains:

**Feature Alignment:**
Learn representations that are domain-invariant

**Adversarial Training:**
```
┌────────────────────────────────────────────────────────────┐
│          Domain Adversarial Training                        │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Sim Images ──┐                                             │
│               ├──► Encoder ──► Features ──► Task Head       │
│  Real Images ─┘        │                                    │
│                        └──► Domain Classifier (adversarial) │
│                                                             │
│  Goal: Features that solve task but fool domain classifier │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Progressive Transfer

Gradually increase realism:

1. Train in simple simulation
2. Add visual complexity
3. Add dynamics complexity
4. Add noise and delays
5. Deploy to real robot

## Learning for Manipulation

### Grasping

Learning robust grasping policies:

**Approaches:**
- **Grasp Quality Networks**: Predict grasp success from images
- **End-to-End Learning**: Direct image to grasp action
- **Self-Supervised**: Robot tries grasps, learns from outcomes

```python
class GraspNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = ResNet18(pretrained=True)
        self.grasp_head = nn.Sequential(
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Linear(64, 6)  # x, y, z, roll, pitch, yaw
        )

    def forward(self, image):
        features = self.encoder(image)
        grasp_pose = self.grasp_head(features)
        return grasp_pose
```

### Dexterous Manipulation

Learning complex hand manipulation:

**Challenges:**
- High-dimensional action space
- Contact-rich dynamics
- Long-horizon tasks

**Approaches:**
- Curriculum learning: Start simple, increase complexity
- Privileged learning: Use extra info in training
- Teacher-student: Distill privileged policy

### Learning from Play

Self-supervised manipulation learning:

- Robot "plays" with objects
- No specific task reward
- Learns diverse skills
- Later fine-tuned for specific tasks

## Learning for Locomotion

### Policy Learning for Walking

Training humanoid locomotion:

```python
def locomotion_reward(state, action):
    reward = 0

    # Forward velocity reward
    reward += 2.0 * state.forward_velocity

    # Alive bonus
    reward += 1.0

    # Energy penalty
    reward -= 0.01 * np.sum(action ** 2)

    # Posture penalty
    reward -= 0.1 * (state.torso_angle ** 2)

    return reward
```

### Reward Shaping

Guiding learning with intermediate rewards:

**Potential-Based Shaping:**
```
R_shaped(s, a, s') = R(s, a, s') + γΦ(s') - Φ(s)

Where Φ is a potential function (e.g., distance to goal)
This preserves optimal policy while accelerating learning.
```

### Terrain Adaptation

Learning to handle varied terrain:

- **Explicit terrain sensing**: Height maps, classification
- **Implicit adaptation**: Learn from proprioception
- **Memory-based**: Remember terrain characteristics

## Foundation Models for Robotics

### Vision-Language Models

Using pretrained models for robotics:

**Applications:**
- Zero-shot object recognition
- Natural language task specification
- Scene understanding

```python
def language_conditioned_policy(image, instruction):
    # Encode image and language
    image_features = clip.encode_image(image)
    text_features = clip.encode_text(instruction)

    # Combined representation
    combined = torch.cat([image_features, text_features], dim=-1)

    # Policy network
    action = policy_network(combined)
    return action
```

### Robot Foundation Models

Large-scale models trained on robot data:

**RT-1, RT-2 (Google):**
- Trained on diverse robot experience
- Multi-task, multi-embodiment
- Language-conditioned

**Gato (DeepMind):**
- Single network for multiple tasks
- Images, text, actions unified

## Practical Considerations

### Data Collection

Efficient data collection for robot learning:

- **Teleoperation**: Human controls robot
- **Kinesthetic teaching**: Physical guidance
- **Autonomous exploration**: Robot collects own data
- **Simulation**: Generate large datasets cheaply

### Safety During Learning

Ensuring safety while robot explores:

```python
class SafeExplorer:
    def __init__(self, policy, safety_critic):
        self.policy = policy
        self.safety_critic = safety_critic

    def get_action(self, state):
        proposed_action = self.policy(state)

        # Check safety
        if self.safety_critic(state, proposed_action) < threshold:
            # Action is unsafe, use backup
            return self.safe_backup_action(state)

        return proposed_action
```

### Evaluation

Measuring learning success:

- **Success rate**: Task completion percentage
- **Sample efficiency**: Experience needed to learn
- **Generalization**: Performance on unseen scenarios
- **Robustness**: Performance under perturbations

## Summary

Machine learning enables robots to acquire complex skills:

- **Imitation Learning**: Learning from demonstrations
- **Reinforcement Learning**: Learning from trial and error
- **Sim-to-Real Transfer**: Training in simulation, deploying in reality
- **Manipulation Learning**: Grasping and dexterous skills
- **Locomotion Learning**: Walking and navigation
- **Foundation Models**: Large-scale pretrained models

Key challenges:
- Sample efficiency
- Safety during learning
- Generalization to new situations
- Bridging the reality gap

## Review Questions

1. Compare behavioral cloning with DAgger.
2. Explain the exploration-exploitation tradeoff in RL.
3. What is domain randomization and why is it useful?
4. How do foundation models change robot learning?
5. What safety considerations are important during robot learning?

## Hands-On Exercise

**Exercise 6.1: Learning a Simple Manipulation Skill**

Train a robot to reach a target position:

1. Set up a simulation environment (PyBullet or Isaac Gym)
2. Define observation space (joint positions, target position)
3. Define action space (joint velocities or torques)
4. Implement a reward function for reaching
5. Train using PPO
6. Evaluate on held-out target positions

Extensions:
- Add obstacles and train collision avoidance
- Add domain randomization
- Transfer to a different robot morphology
